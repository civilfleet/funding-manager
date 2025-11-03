import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/nodemailer";
import { getLoginUrl, handlePrismaError } from "@/lib/utils";
import {
  createOrUpdateOrganization,
  getOrganizations,
} from "@/services/organizations";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/validations/organizations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const teamId = searchParams.get("teamId") || "";

    const data = await getOrganizations(searchQuery, teamId);

    return NextResponse.json(
      {
        data,
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

export async function POST(req: Request) {
  try {
    const organizationData = await req.json();
    console.log(organizationData, "organizationData");
    const validatedData = createOrganizationSchema
      .and(z.object({ teamId: z.string().uuid() }))
      .and(z.object({ isFilledByOrg: z.boolean() }))
      .parse({ ...organizationData });
    const { organization, user } =
      await createOrUpdateOrganization(validatedData);

    // if teamId is provided, it means the organization is created by a team
    if (organizationData.teamId) {
      const loginUrl = getLoginUrl();
      const appUrl = getAppUrl();
      const subject = appUrl
        ? `You're In! Welcome to ${appUrl}.`
        : "You're In! Welcome.";

      await Promise.all([
        sendEmail(
          {
            to: organization.email,
            subject,
            template: "welcome",
          },
          {
            name: organization.name,
            email: validatedData.email,
            loginUrl,
            appUrl,
          },
        ),
        sendEmail(
          {
            to: user?.email as string,
            subject,
            template: "welcome",
          },
          {
            name: user?.name,
            email: user?.email,
            loginUrl,
            appUrl,
          },
        ),
      ]);
    }

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 201 },
    );
  } catch (e) {
    const { message } = handlePrismaError(e);
    console.log(message, "message");
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}

// ✅ POST (Create Organization)
export async function PUT(req: Request) {
  try {
    const organization = await req.json();
    const validatedData = updateOrganizationSchema
      .and(z.object({ isFilledByOrg: z.boolean() }))
      .parse({ ...organization });
    await createOrUpdateOrganization(validatedData);
    return NextResponse.json(
      {
        message: "success",
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
