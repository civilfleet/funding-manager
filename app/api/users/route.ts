import { NextResponse } from "next/server";
import { createUserSchema } from "@/validations/organizations";
import { auth } from "@/auth";
import { createUser, getUsers, getUsersForDonation } from "@/services/users";
import { handlePrismaError } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer";
import { Roles } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const teamId = searchParams.get("teamId") || "";
    const fundingRequestId = searchParams.get("fundingRequestId") || "";
    const organizationId = searchParams.get("organizationId") || "";
    let data;

    if (fundingRequestId && teamId) {
      data = await getUsersForDonation({
        teamId: teamId,
        fundingRequestId: fundingRequestId,
      });
    } else {
      data = await getUsers(
        {
          teamId: teamId || undefined,
          organizationId: organizationId || undefined,
        },
        searchQuery
      );
    }

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

    if (!user.teamId) {
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
