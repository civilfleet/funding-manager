import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  CONTACT_SUBMODULE_FIELDS,
  CONTACT_SUBMODULES,
  type ContactSubmodule,
} from "@/constants/contact-submodules";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "teamId is required" },
        { status: 400 },
      );
    }

    const session = await auth();
    let userId = session?.user?.userId ?? undefined;

    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const [accessEntries, userGroups] = await Promise.all([
      prisma.contactFieldAccess.findMany({
        where: { teamId },
        select: {
          fieldKey: true,
          groupId: true,
        },
      }),
      prisma.userGroup.findMany({
        where: {
          userId,
          group: {
            teamId,
          },
        },
        select: {
          groupId: true,
        },
      }),
    ]);

    const accessMap = new Map<string, Set<string>>();
    accessEntries.forEach((entry) => {
      const existing = accessMap.get(entry.fieldKey);
      if (existing) {
        existing.add(entry.groupId);
        return;
      }
      accessMap.set(entry.fieldKey, new Set([entry.groupId]));
    });

    const userGroupIds = new Set(userGroups.map((group) => group.groupId));

    const isFieldVisible = (fieldKey: string) => {
      const allowedGroups = accessMap.get(fieldKey);
      if (!allowedGroups || allowedGroups.size === 0) {
        return true;
      }
      for (const groupId of userGroupIds) {
        if (allowedGroups.has(groupId)) {
          return true;
        }
      }
      return false;
    };

    const allowedSubmodules = CONTACT_SUBMODULES.filter((submodule) => {
      const fields = CONTACT_SUBMODULE_FIELDS[submodule];
      if (!fields.length) {
        return false;
      }
      return fields.some((fieldKey) => isFieldVisible(fieldKey));
    }) as ContactSubmodule[];

    return NextResponse.json({ data: allowedSubmodules }, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
