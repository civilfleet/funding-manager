import { IntegrationProvider as PrismaIntegrationProvider } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  fetchKlaviyoEmailEvents,
  fetchKlaviyoProfiles,
  maskKlaviyoApiKey,
  testKlaviyoCredentials,
  type KlaviyoEvent,
  type KlaviyoProfile,
} from "@/lib/klaviyo";
import {
  EngagementDirection,
  EngagementSource,
  IntegrationProvider,
  type IntegrationConnection,
} from "@/types";

const EXTERNAL_SOURCE = "KLAVIYO";

export type KlaviyoIntegrationSettings = IntegrationConnection & {
  hasApiKey: boolean;
  apiKeyPreview?: string;
  connectionVerified?: boolean;
  connectionMessage?: string;
};

export type KlaviyoSyncResult = {
  contactsCreated: number;
  contactsUpdated: number;
  engagementsUpserted: number;
  lastSyncedAt: Date;
};

const getContactName = (profile: KlaviyoProfile, fallback: string) => {
  const first = profile.attributes.first_name?.trim() ?? "";
  const last = profile.attributes.last_name?.trim() ?? "";
  const name = [first, last].filter(Boolean).join(" ").trim();
  if (name) {
    return name;
  }
  return fallback;
};

const upsertContactFromProfile = async (
  teamId: string,
  profile: KlaviyoProfile,
) => {
  const email = profile.attributes.email?.trim()?.toLowerCase();
  if (!email) {
    return null;
  }

  const existing = await prisma.contact.findUnique({
    where: {
      teamId_email: {
        teamId,
        email,
      },
    },
  });

  const name = getContactName(profile, email);
  const phone = profile.attributes.phone_number?.trim() || undefined;
  const city =
    profile.attributes.location?.city?.trim() ||
    profile.attributes.location?.region?.trim() ||
    undefined;

  if (existing) {
    const updated = await prisma.contact.update({
      where: { id: existing.id },
      data: {
        name,
        phone,
        city,
      },
    });
    return {
      contactId: updated.id,
      created: false,
    };
  }

  const created = await prisma.contact.create({
    data: {
      teamId,
      name,
      email,
      phone,
      city,
    },
  });

  return {
    contactId: created.id,
    created: true,
  };
};

const resolveEngagementDirection = (metricName?: string) => {
  const lower = metricName?.toLowerCase() ?? "";
  if (
    lower.includes("open") ||
    lower.includes("click") ||
    lower.includes("reply") ||
    lower.includes("responded")
  ) {
    return EngagementDirection.INBOUND;
  }
  return EngagementDirection.OUTBOUND;
};

const buildEngagementContent = (event: KlaviyoEvent) => {
  const properties = event.attributes.properties ?? {};
  const possibleBodyFields = [
    (properties.body as string | undefined),
    (properties.Body as string | undefined),
    (properties.preview_text as string | undefined),
  ];
  const body = possibleBodyFields.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  const subject =
    (properties.subject as string | undefined) ||
    (properties.Subject as string | undefined) ||
    event.attributes.metric?.name ||
    "Email engagement";

  const message = body?.trim() || subject;

  return {
    subject,
    message,
  };
};

const getEmailFromEvent = (event: KlaviyoEvent) => {
  const properties = event.attributes.properties ?? {};
  const possibleEmailFields = [
    (properties.email as string | undefined),
    (properties.to as string | undefined),
    (properties.recipient as string | undefined),
  ];

  const email = possibleEmailFields.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return email?.toLowerCase();
};

const createEngagementFromEvent = async ({
  teamId,
  contactId,
  event,
}: {
  teamId: string;
  contactId: string;
  event: KlaviyoEvent;
}) => {
  const direction = resolveEngagementDirection(event.attributes.metric?.name);
  const { subject, message } = buildEngagementContent(event);

  const engagedAt = event.attributes.timestamp
    ? new Date(event.attributes.timestamp)
    : new Date();

  await prisma.contactEngagement.upsert({
    where: {
      teamId_externalId_externalSource: {
        teamId,
        externalId: event.id,
        externalSource: EXTERNAL_SOURCE,
      },
    },
    update: {
      direction,
      source: EngagementSource.EMAIL,
      subject,
      message,
      engagedAt,
    },
    create: {
      contactId,
      teamId,
      direction,
      source: EngagementSource.EMAIL,
      subject,
      message,
      engagedAt,
      externalId: event.id,
      externalSource: EXTERNAL_SOURCE,
    },
  });
};

export const getKlaviyoIntegration = async (
  teamId: string,
): Promise<KlaviyoIntegrationSettings | null> => {
  const integration = await prisma.integrationConnection.findUnique({
    where: {
      teamId_provider: {
        teamId,
        provider: PrismaIntegrationProvider.KLAVIYO,
      },
    },
  });

  if (!integration) {
    return null;
  }

  return {
    id: integration.id,
    teamId: integration.teamId,
    provider: IntegrationProvider.KLAVIYO,
    defaultListId: integration.defaultListId ?? undefined,
    isEnabled: integration.isEnabled,
    lastSyncedAt: integration.lastSyncedAt ?? undefined,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,
    hasApiKey: Boolean(integration.apiKey),
    apiKeyPreview: maskKlaviyoApiKey(integration.apiKey),
    connectionVerified: Boolean(integration.apiKey) && integration.isEnabled,
  };
};

export const saveKlaviyoIntegration = async ({
  teamId,
  apiKey,
  defaultListId,
  isEnabled,
  shouldTestConnection,
}: {
  teamId: string;
  apiKey?: string;
  defaultListId?: string;
  isEnabled?: boolean;
  shouldTestConnection?: boolean;
}): Promise<KlaviyoIntegrationSettings> => {
  const existing = await prisma.integrationConnection.findUnique({
    where: {
      teamId_provider: {
        teamId,
        provider: PrismaIntegrationProvider.KLAVIYO,
      },
    },
  });

  const apiKeyToPersist = apiKey?.trim() || existing?.apiKey;

  if (!apiKeyToPersist) {
    throw new Error("API key is required to configure Klaviyo integration.");
  }

  if (shouldTestConnection) {
    await testKlaviyoCredentials(apiKeyToPersist);
  }

  const record = await prisma.integrationConnection.upsert({
    where: {
      teamId_provider: {
        teamId,
        provider: PrismaIntegrationProvider.KLAVIYO,
      },
    },
    update: {
      apiKey: apiKeyToPersist,
      defaultListId,
      isEnabled: isEnabled ?? existing?.isEnabled ?? true,
    },
    create: {
      teamId,
      provider: PrismaIntegrationProvider.KLAVIYO,
      apiKey: apiKeyToPersist,
      defaultListId,
      isEnabled: isEnabled ?? true,
    },
  });

  return {
    id: record.id,
    teamId: record.teamId,
    provider: IntegrationProvider.KLAVIYO,
    defaultListId: record.defaultListId ?? undefined,
    isEnabled: record.isEnabled,
    lastSyncedAt: record.lastSyncedAt ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    hasApiKey: Boolean(record.apiKey),
    apiKeyPreview: maskKlaviyoApiKey(record.apiKey),
    connectionVerified: true,
    connectionMessage: shouldTestConnection
      ? "Connection successful"
      : undefined,
  };
};

export const syncKlaviyoIntegration = async (
  teamId: string,
): Promise<KlaviyoSyncResult> => {
  const integration = await prisma.integrationConnection.findUnique({
    where: {
      teamId_provider: {
        teamId,
        provider: PrismaIntegrationProvider.KLAVIYO,
      },
    },
  });

  if (!integration || !integration.apiKey) {
    throw new Error("Klaviyo integration is not configured for this team.");
  }

  if (!integration.isEnabled) {
    throw new Error("Klaviyo integration is currently disabled.");
  }

  const profileIdToContactId = new Map<string, string>();
  const emailToContactId = new Map<string, string>();
  let contactsCreated = 0;
  let contactsUpdated = 0;

  let profileCursor: string | undefined;
  do {
    const { profiles, nextCursor } = await fetchKlaviyoProfiles(
      integration.apiKey,
      profileCursor,
    );

    for (const profile of profiles) {
      const result = await upsertContactFromProfile(teamId, profile);
      if (result) {
        if (result.created) {
          contactsCreated += 1;
        } else {
          contactsUpdated += 1;
        }
        profileIdToContactId.set(profile.id, result.contactId);
        const email = profile.attributes.email?.toLowerCase();
        if (email) {
          emailToContactId.set(email, result.contactId);
        }
      }
    }

    profileCursor = nextCursor;
  } while (profileCursor);

  let engagementsUpserted = 0;
  let eventsCursor: string | undefined;
  do {
    const { events, nextCursor } = await fetchKlaviyoEmailEvents(
      integration.apiKey,
      eventsCursor,
    );

    for (const event of events) {
      const profileId = event.relationships?.profile?.data?.id;
      const email = getEmailFromEvent(event);
      const contactIdFromProfile = profileId
        ? profileIdToContactId.get(profileId)
        : undefined;
      const contactIdFromEmail = email
        ? emailToContactId.get(email)
        : undefined;

      const contactId = contactIdFromProfile ?? contactIdFromEmail;
      if (!contactId) {
        continue;
      }

      await createEngagementFromEvent({
        teamId,
        contactId,
        event,
      });
      engagementsUpserted += 1;
    }

    eventsCursor = nextCursor;
  } while (eventsCursor);

  const now = new Date();
  await prisma.integrationConnection.update({
    where: {
      teamId_provider: {
        teamId,
        provider: PrismaIntegrationProvider.KLAVIYO,
      },
    },
    data: {
      lastSyncedAt: now,
    },
  });

  return {
    contactsCreated,
    contactsUpdated,
    engagementsUpserted,
    lastSyncedAt: now,
  };
};
