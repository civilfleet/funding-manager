import prisma from "@/lib/prisma";
import { ContactEngagement, EngagementDirection, EngagementSource } from "@/types";
import { Prisma } from "@prisma/client";

type CreateEngagementInput = {
  contactId: string;
  teamId: string;
  direction: EngagementDirection;
  source: EngagementSource;
  subject?: string;
  message: string;
  userId?: string;
  userName?: string;
  engagedAt: Date;
};

type ContactEngagementWithDefaults = Prisma.ContactEngagementGetPayload<{}>;

const mapEngagement = (engagement: ContactEngagementWithDefaults): ContactEngagement => ({
  id: engagement.id,
  contactId: engagement.contactId,
  teamId: engagement.teamId,
  direction: engagement.direction as EngagementDirection,
  source: engagement.source as EngagementSource,
  subject: engagement.subject ?? undefined,
  message: engagement.message,
  userId: engagement.userId ?? undefined,
  userName: engagement.userName ?? undefined,
  engagedAt: engagement.engagedAt,
  createdAt: engagement.createdAt,
  updatedAt: engagement.updatedAt,
});

const getContactEngagements = async (contactId: string, teamId: string) => {
  const engagements = await prisma.contactEngagement.findMany({
    where: {
      contactId,
      teamId,
    },
    orderBy: {
      engagedAt: "desc",
    },
  });

  return engagements.map(mapEngagement);
};

const createEngagement = async (input: CreateEngagementInput) => {
  const engagement = await prisma.contactEngagement.create({
    data: {
      contactId: input.contactId,
      teamId: input.teamId,
      direction: input.direction,
      source: input.source,
      subject: input.subject,
      message: input.message,
      userId: input.userId,
      userName: input.userName,
      engagedAt: input.engagedAt,
    },
  });

  return mapEngagement(engagement);
};

const deleteEngagement = async (id: string, teamId: string) => {
  await prisma.contactEngagement.delete({
    where: {
      id,
      teamId,
    },
  });
};

export { getContactEngagements, createEngagement, deleteEngagement };
