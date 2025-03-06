import { NextResponse } from "next/server";
import { createContactSchema } from "@/validations/organizations";
import { auth } from "@/auth";
import {
  createContactPerson,
  getContactPersons,
} from "@/services/contact-person";
import { handlePrismaError } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const session = await auth();
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

    await sendEmail(
      {
        to: validatedData.email,
        subject: "You’re In! Welcome to Partner App.",
        template: "welcome",
      },
      {
        name: validatedData.name,
        email: validatedData.email,
      }
    );

    return NextResponse.json(
      {
        data: "success",
      },

      { status: 201 }
    );
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message }
    );
  }
}
