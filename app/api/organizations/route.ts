import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/lib/nodemailer";
import { APP_NAME } from "@/constants/app";
import { getAppUrl, getLoginUrl, handlePrismaError } from "@/lib/utils";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import {
  createOrUpdateOrganization,
  getOrganizations,
} from "@/services/organizations";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/validations/organizations";
import { organizationFiltersSchema } from "@/validations/organization-filters";
import { DEFAULT_TEAM_MODULES } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const teamId = searchParams.get("teamId") || "";
    const filtersParam = searchParams.get("filters");
    const parsedFilters = filtersParam
      ? organizationFiltersSchema.parse(JSON.parse(filtersParam))
      : [];

    const data = await getOrganizations(searchQuery, teamId, parsedFilters);

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
    logger.debug(
      {
        teamId: organizationData?.teamId,
        isFilledByOrg: organizationData?.isFilledByOrg,
      },
      "Organization create request received",
    );
    const validatedData = createOrganizationSchema
      .and(z.object({ teamId: z.string().uuid() }))
      .and(z.object({ isFilledByOrg: z.boolean() }))
      .parse({ ...organizationData });

    if (validatedData.isFilledByOrg) {
      const team = await prisma.teams.findUnique({
        where: { id: validatedData.teamId },
        select: { modules: true },
      });
      const teamModules =
        team?.modules && team.modules.length > 0
          ? team.modules
          : [...DEFAULT_TEAM_MODULES];

      if (!team || !teamModules.includes("FUNDING")) {
        return NextResponse.json(
          { error: "Organization self-registration is disabled" },
          { status: 403, statusText: "Organization self-registration is disabled" },
        );
      }
    }
    const normalizedData = {
      ...validatedData,
      profileData: validatedData.profileData as Prisma.InputJsonValue | undefined,
    };
    const { organization, user } =
      await createOrUpdateOrganization(normalizedData);

    // if teamId is provided, it means the organization is created by a team
    if (organizationData.teamId) {
      const loginUrl = getLoginUrl();
      const appUrl = getAppUrl();
      const appName = APP_NAME;
      const subject = appUrl
        ? `You're In! Welcome to ${appUrl}.`
        : `You're In! Welcome to ${appName}.`;

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
            appName,
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
            appName,
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
    logger.error({ message }, "Organization create failed");
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
    const normalizedData = {
      ...validatedData,
      profileData: validatedData.profileData as Prisma.InputJsonValue | undefined,
    };
    await createOrUpdateOrganization(normalizedData);
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
