import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import { createContactSchema } from "@/validations/organizations";
import { auth } from "@/auth";
import {
  createContactPerson,
  getContactPersons,
} from "@/services/contact-person";
import { handlePrismaError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await auth();
    console.log(session, "contacts");
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";

    const data = await getContactPersons(
      {
        organizationId: session?.user?.organizationId,
        teamId: session?.user?.teamId,
      },
      searchQuery
    );

    return NextResponse.json(
      { data },

      { status: 201 }
    );
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json(
      { error: handledError?.message },
      { status: 400, statusText: handledError?.message }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const contactPerson = await req.json();
    const validatedData = createContactSchema.parse({
      ...contactPerson,
    });

    // If the user is an organization user, create a contact person for the organization
    // If the user is a team user, create a contact person for the team
    if (session?.user?.organizationId) {
      await createContactPerson({
        ...validatedData,
        organizationId: session?.user?.organizationId,
        type: "Organization",
      });
    } else {
      await createContactPerson({
        ...validatedData,
        teamId: session?.user?.teamId,
        type: "Team",
      });
    }

    return NextResponse.json(
      {
        data: "success",
      },

      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 400, statusText: getErrorMessage(e) }
    );
  }
}
