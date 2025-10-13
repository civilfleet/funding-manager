import prisma from "@/lib/prisma";
import { ContactChangeLog, ChangeAction } from "@/types";
import { Prisma } from "@prisma/client";

type CreateChangeLogInput = {
  contactId: string;
  action: ChangeAction;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  userName?: string;
};

type ContactChangeLogWithDefaults = Prisma.ContactChangeLogGetPayload<{}>;

const mapChangeLog = (log: ContactChangeLogWithDefaults): ContactChangeLog => ({
  id: log.id,
  contactId: log.contactId,
  action: log.action as ChangeAction,
  fieldName: log.fieldName ?? undefined,
  oldValue: log.oldValue ?? undefined,
  newValue: log.newValue ?? undefined,
  userId: log.userId ?? undefined,
  userName: log.userName ?? undefined,
  createdAt: log.createdAt,
});

const getContactChangeLogs = async (contactId: string) => {
  const logs = await prisma.contactChangeLog.findMany({
    where: {
      contactId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return logs.map(mapChangeLog);
};

const createChangeLog = async (
  input: CreateChangeLogInput,
  tx?: Prisma.TransactionClient
) => {
  const log = await (tx ?? prisma).contactChangeLog.create({
    data: {
      contactId: input.contactId,
      action: input.action,
      fieldName: input.fieldName,
      oldValue: input.oldValue,
      newValue: input.newValue,
      userId: input.userId,
      userName: input.userName,
    },
  });

  return mapChangeLog(log);
};

// Helper function to log contact creation
const logContactCreation = async (
  contactId: string,
  userId?: string,
  userName?: string,
  tx?: Prisma.TransactionClient
) => {
  return createChangeLog({
    contactId,
    action: ChangeAction.CREATED,
    userId,
    userName,
  }, tx);
};

// Helper function to log field updates
const logFieldUpdate = async (
  contactId: string,
  fieldName: string,
  oldValue: unknown,
  newValue: unknown,
  userId?: string,
  userName?: string,
  tx?: Prisma.TransactionClient
) => {
  // Convert values to strings for storage
  const oldStr = oldValue !== undefined && oldValue !== null ? JSON.stringify(oldValue) : undefined;
  const newStr = newValue !== undefined && newValue !== null ? JSON.stringify(newValue) : undefined;

  return createChangeLog({
    contactId,
    action: ChangeAction.UPDATED,
    fieldName,
    oldValue: oldStr,
    newValue: newStr,
    userId,
    userName,
  }, tx);
};

export { getContactChangeLogs, createChangeLog, logContactCreation, logFieldUpdate };
