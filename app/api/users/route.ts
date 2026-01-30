import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/nodemailer";
import { APP_NAME } from "@/constants/app";
import { getAppUrl, getLoginUrl, handlePrismaError } from "@/lib/utils";
import { createUser, getUsers, getUsersForDonation } from "@/services/users";
import { ensureTeamOwner } from "@/services/teams";
import { Roles } from "@/types";
import { createUserSchema } from "@/validations/organizations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const teamId = searchParams.get("teamId") || "";
    const fundingRequestId = searchParams.get("fundingRequestId") || "";
    const organizationId = searchParams.get("organizationId") || "";
    const dataPromise =
      fundingRequestId && teamId
        ? getUsersForDonation({
            teamId,
            fundingRequestId,
          })
        : getUsers(
            {
              teamId: teamId || undefined,
              organizationId: organizationId || undefined,
            },
            searchQuery,
          );

    const ownerPromise = teamId ? ensureTeamOwner(teamId) : undefined;

    const [data, ownerId] = await Promise.all([
      dataPromise,
      ownerPromise ?? Promise.resolve(undefined),
    ]);

    return NextResponse.json(
      { data, ownerId: ownerId ?? null },

      { status: 201 },
    );
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json(
      { error: handledError?.message },
      { status: 400, statusText: handledError?.message },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await req.json();
    const teamId = user.teamId;
    const organizationId = user.organizationId;
    const validatedData = createUserSchema.parse({
      ...user,
    }) as { email: string; name: string } & typeof user;

    if (!teamId) {
      await createUser({
        ...validatedData,
        organizationId: organizationId,
        roles: user.roles || [Roles.Organization],
      });
    } else {
      await createUser({
        ...validatedData,
        teamId: teamId,
        roles: user.roles || [Roles.Team],
      });
    }

    const loginUrl = getLoginUrl();
    const appUrl = getAppUrl();
    const appName = APP_NAME;

    const subject = appUrl
      ? `You're In! Welcome to ${appUrl}.`
      : `You're In! Welcome to ${appName}.`;

    await sendEmail(
      {
        to: validatedData.email,
        subject,
        template: "welcome",
      },
      {
        name: validatedData.name,
        email: validatedData.email,
        loginUrl,
        appUrl,
        appName,
      },
    );

    return NextResponse.json(
      {
        data: "success",
      },

      { status: 201 },
    );
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
