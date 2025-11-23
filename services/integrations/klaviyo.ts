import { IntegrationProvider as PrismaIntegrationProvider } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  fetchKlaviyoEmailEvents,
  fetchKlaviyoEventDetails,
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
import { logContactCreation } from "@/services/contact-change-logs";

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
  fallbackContactsCreated: number;
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

const normalizeEmail = (email?: string) => email?.trim().toLowerCase() ?? "";

const upsertContactFromProfile = async (
  teamId: string,
  profile: KlaviyoProfile,
) => {
  const email = normalizeEmail(profile.attributes.email);
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

  await logContactCreation(created.id, undefined, "Klaviyo import", prisma);

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

const getEventProperties = (event: KlaviyoEvent) =>
  event.attributes.properties ??
  // @ts-expect-error Klaviyo uses event_properties in API responses
  event.attributes.event_properties ??
  {};

const buildEngagementContent = (event: KlaviyoEvent, profileId?: string) => {
  const properties = getEventProperties(event);
  const possibleBodyFields = [
    (properties.body as string | undefined),
    (properties.Body as string | undefined),
    (properties.preview_text as string | undefined),
    (properties["$message"] as string | undefined),
  ];
  const body = possibleBodyFields.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  const subject =
    (properties.subject as string | undefined) ||
    (properties.Subject as string | undefined) ||
    (properties["Campaign Name"] as string | undefined) ||
    (properties.campaign_name as string | undefined) ||
    event.attributes.metric?.name ||
    "Email engagement";

  const detailEntries: Array<[string, string]> = [];
  const addDetail = (label: string, value?: unknown) => {
    if (value === undefined || value === null) {
      return;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const normalized = String(value).trim();
      if (normalized) {
        detailEntries.push([label, normalized]);
      }
      return;
    }
    // For objects/arrays, include JSON string.
    try {
      detailEntries.push([label, JSON.stringify(value)]);
    } catch {
      // ignore non-serializable
    }
  };

  addDetail("Recipient", properties["Recipient Email Address"]);
  addDetail("Recipient", properties.recipient);
  addDetail("Recipient", properties.email);
  addDetail("Recipient", properties.to_email);
  addDetail("Recipient", properties.email_address);
  addDetail("Recipient", properties.to);
  addDetail("Recipient", properties.from_email);
  addDetail("Recipient", properties.from);
  addDetail("Recipient", properties.customer_email);
  addDetail("Subject", properties.subject ?? properties.Subject);
  addDetail("Campaign Name", properties["Campaign Name"] ?? properties.campaign_name);
  addDetail("Inbox Provider", properties["Inbox Provider"]);
  addDetail("Email Domain", properties["Email Domain"] ?? properties.email_domain ?? properties.domain);
  addDetail("Message Id", properties.message_id as string | undefined);
  addDetail("Klaviyo Message", properties["$message"] as string | undefined);
  addDetail("Metric", event.attributes.metric?.name ?? event.attributes.metric?.id);
  addDetail("Event Timestamp", event.attributes.timestamp);
  addDetail("Event Id", event.id);
  addDetail("Profile Id", profileId);

  // Include any remaining primitive properties to show full context
  Object.entries(properties).forEach(([key, value]) => {
    if (["body", "Body", "preview_text", "subject", "Subject", "$message"].includes(key)) {
      return;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const normalized = String(value).trim();
      if (normalized) {
        detailEntries.push([key, normalized]);
      }
      return;
    }
    try {
      const serialized = JSON.stringify(value, null, 2);
      if (serialized && serialized !== "{}" && serialized !== "[]") {
        detailEntries.push([`${key} (json)`, serialized]);
      }
    } catch {
      // ignore non-serializable values
    }
  });

  try {
    const rawEventJson = JSON.stringify(
      {
        id: event.id,
        metric: event.attributes.metric,
        properties,
        timestamp: event.attributes.timestamp,
        profileId,
      },
      null,
      2,
    );
    detailEntries.push(["Raw Event", rawEventJson]);
  } catch {
    // ignore serialization failure
  }

  const detailsText =
    detailEntries.length > 0
      ? detailEntries.map(([label, value]) => `${label}: ${value}`).join("\n")
      : JSON.stringify(
          {
            metric: event.attributes.metric,
            properties,
            timestamp: event.attributes.timestamp,
            profileId,
            rawEvent: event,
          },
          null,
          2,
        );

  const message = body?.trim()
    ? [body.trim(), detailsText].filter(Boolean).join("\n\n")
    : [subject, detailsText].filter(Boolean).join("\n\n");

  return {
    subject,
    message: message || subject,
  };
};

const getEmailFromEvent = (event: KlaviyoEvent) => {
  const properties = event.attributes.properties ?? {};
  const possibleEmailFields = [
    (properties.email as string | undefined),
    (properties.to as string | undefined),
    (properties.recipient as string | undefined),
    (properties.to_email as string | undefined),
    (properties.email_address as string | undefined),
    (properties.from_email as string | undefined),
    (properties.from as string | undefined),
    (properties.customer_email as string | undefined),
  ];

  const email = possibleEmailFields.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return normalizeEmail(email);
};

const createEngagementFromEvent = async ({
  teamId,
  contactId,
  event,
  profileId,
  apiKey,
}: {
  teamId: string;
  contactId: string;
  event: KlaviyoEvent;
  profileId?: string;
  apiKey: string;
}) => {
  const direction = resolveEngagementDirection(event.attributes.metric?.name);

  let enrichedEvent = event;

  const properties = getEventProperties(event);
  const hasMeaningfulProperties =
    properties && Object.keys(properties).length > 0;
  const hasMetricDetails = Boolean(event.attributes.metric?.name);
  const hasProfile = Boolean(event.relationships?.profile?.data?.id);

  if (!hasMeaningfulProperties || !hasMetricDetails || !hasProfile) {
    try {
      const detail = await fetchKlaviyoEventDetails(apiKey, event.id);
      if (detail?.attributes?.properties && Object.keys(detail.attributes.properties).length > 0) {
        enrichedEvent = {
          ...event,
          attributes: { ...event.attributes, ...detail.attributes },
          relationships: detail.relationships ?? event.relationships,
        };
      } else {
        enrichedEvent = detail ?? event;
      }
    } catch (_error) {
      // Fallback to the original event if detail fetch fails.
    }
  }

  const { subject, message } = buildEngagementContent(enrichedEvent, profileId);

  const rawTimestamp = enrichedEvent.attributes.timestamp;
  const engagedAt = (() => {
    if (typeof rawTimestamp === "number") {
      return new Date(
        rawTimestamp > 2_000_000_000 ? rawTimestamp : rawTimestamp * 1000,
      );
    }
    if (typeof rawTimestamp === "string") {
      const asNumber = Number(rawTimestamp);
      if (!Number.isNaN(asNumber) && asNumber > 0) {
        return new Date(
          asNumber > 2_000_000_000 ? asNumber : asNumber * 1000,
        );
      }
      const parsed = new Date(rawTimestamp);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  })();

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
  let fallbackContactsCreated = 0;

  const ensureContactForEmail = async (email?: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      return null;
    }

    const cached = emailToContactId.get(normalized);
    if (cached) {
      return cached;
    }

    const existing = await prisma.contact.findUnique({
      where: {
        teamId_email: {
          teamId,
          email: normalized,
        },
      },
    });

    if (existing) {
      emailToContactId.set(normalized, existing.id);
      return existing.id;
    }

    const created = await prisma.contact.create({
      data: {
        teamId,
        email: normalized,
        name: normalized,
      },
    });
    await logContactCreation(created.id, undefined, "Klaviyo import", prisma);
    fallbackContactsCreated += 1;
    emailToContactId.set(normalized, created.id);
    return created.id;
  };

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
        const email = normalizeEmail(profile.attributes.email);
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

      let contactId = contactIdFromProfile ?? contactIdFromEmail;

      if (!contactId && email) {
        contactId = await ensureContactForEmail(email);
      }

      if (!contactId) {
        continue;
      }

      await createEngagementFromEvent({
        teamId,
        contactId,
        event,
        profileId,
        apiKey: integration.apiKey,
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
    fallbackContactsCreated,
    lastSyncedAt: now,
  };
};
