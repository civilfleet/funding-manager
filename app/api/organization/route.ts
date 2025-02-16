import { NextResponse } from "next/server";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/validations/organizations";
import { getErrorMessage } from "../helpers";
import {
  createOrUpdateOrganization,
  getOrganizations,
} from "@/services/organizations";
import { z } from "zod";
import { auth } from "@/auth";

// GET organization will only access by teams
export async function GET(req: Request) {
  try {
    const session = await auth();
    const teamId = session?.user?.teamId as string;

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const data = await getOrganizations(searchQuery, teamId);

    return NextResponse.json(
      {
        data,
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

// ✅ POST (Create Organization)
export async function POST(req: Request) {
  try {
    const organization = await req.json();

    const validatedData = createOrganizationSchema
      .and(z.object({ teamId: z.string().uuid() }))
      .and(z.object({ isFilledByOrg: z.boolean() }))
      .parse({ ...organization });
    await createOrUpdateOrganization(validatedData);
    return NextResponse.json(
      {
        message: "success",
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
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 400, statusText: getErrorMessage(e) }
    );
  }
}
