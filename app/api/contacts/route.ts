import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import {
  createContact,
  deleteContacts,
  getTeamContacts,
  updateContact,
} from "@/services/contacts";
import {
  createContactSchema,
  deleteContactsSchema,
  contactFiltersSchema,
  updateContactSchema,
} from "@/validations/contacts";
import type { ContactFilterInput } from "@/validations/contacts";
import type { Roles } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const query = searchParams.get("query") || "";
    const filtersParam = searchParams.get("filters");

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

    let filters: ContactFilterInput[] | undefined;
    if (filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam);
        filters = contactFiltersSchema.parse(parsed);
      } catch (_error) {
        return NextResponse.json(
          { error: "Invalid filters parameter" },
          { status: 400 },
        );
      }
    }

    const roles = (session?.user?.roles ?? []) as Roles[];

    const contacts = await getTeamContacts(
      teamId,
      query || undefined,
      userId,
      filters,
      roles,
    );
    return NextResponse.json({ data: contacts }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const payload = await req.json();
    const validated = createContactSchema.parse(payload);

    const userId = session?.user?.userId;
    const userName = session?.user?.name ?? undefined;

    const contact = await createContact(validated, userId, userName);

    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const payload = await req.json();
    const validated = updateContactSchema.parse(payload);

    const userId = session?.user?.userId;
    const userName = session?.user?.name ?? undefined;

    const contact = await updateContact(validated, userId, userName);

    return NextResponse.json({ data: contact }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await req.json();
    const validated = deleteContactsSchema.parse(payload);

    await deleteContacts(validated.teamId, validated.ids);

    return NextResponse.json({ data: "success" }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
