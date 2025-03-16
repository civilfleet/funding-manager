import { NextResponse } from "next/server";
import { createUserSchema } from "@/validations/organizations";
import { auth } from "@/auth";
import { createUser, getUsers } from "@/services/users";
import { handlePrismaError } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer";
import { Roles } from "@/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";

    const data = await getUsers(
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
    const user = await req.json();
    const validatedData = createUserSchema.parse({
      ...user,
    });

    if (session?.user?.organizationId) {
      await createUser({
        ...validatedData,
        organizationId: session?.user?.organizationId,
        roles: [Roles.Organization],
      });
    } else {
      await createUser({
        ...validatedData,
        teamId: session?.user?.teamId,
        roles: [Roles.Team],
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
