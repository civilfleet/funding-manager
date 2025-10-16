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
  updateContactSchema,
} from "@/validations/contacts";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const query = searchParams.get("query") || "";

    if (!teamId) {
      return NextResponse.json(
        { error: "teamId is required" },
        { status: 400 },
      );
    }

    // Get the current user's ID for group filtering
    const session = await auth();
    let userId: string | undefined;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id;
    }

    const contacts = await getTeamContacts(teamId, query || undefined, userId);
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
    const payload = await req.json();
    const validated = createContactSchema.parse(payload);

    const contact = await createContact(validated);

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
    const payload = await req.json();
    const validated = updateContactSchema.parse(payload);

    const contact = await updateContact(validated);

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
