import prisma from "@/lib/prisma";
import { ContactEngagement, EngagementDirection, EngagementSource, TodoStatus } from "@/types";
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
  assignedToUserId?: string;
  assignedToUserName?: string;
  todoStatus?: TodoStatus;
  dueDate?: Date;
  engagedAt: Date;
};

type UpdateEngagementInput = {
  id: string;
  teamId: string;
  subject?: string;
  message?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  todoStatus?: TodoStatus;
  dueDate?: Date;
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
  assignedToUserId: engagement.assignedToUserId ?? undefined,
  assignedToUserName: engagement.assignedToUserName ?? undefined,
  todoStatus: engagement.todoStatus ? (engagement.todoStatus as TodoStatus) : undefined,
  dueDate: engagement.dueDate ?? undefined,
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
      assignedToUserId: input.assignedToUserId,
      assignedToUserName: input.assignedToUserName,
      todoStatus: input.todoStatus,
      dueDate: input.dueDate,
      engagedAt: input.engagedAt,
    },
  });

  return mapEngagement(engagement);
};

const updateEngagement = async (input: UpdateEngagementInput) => {
  const { id, teamId, ...updateData } = input;

  const engagement = await prisma.contactEngagement.update({
    where: {
      id,
      teamId,
    },
    data: updateData,
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

export { getContactEngagements, createEngagement, updateEngagement, deleteEngagement };
