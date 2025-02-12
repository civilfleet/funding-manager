import { NextResponse } from "next/server";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/validations/organizations";
import { getErrorMessage } from "../helpers";
import {
  createOrUpdateOrganization,
  getOrganizationByEmail,
  getOrganizations,
} from "@/services/organizations";
import { z } from "zod";
import { update } from "lodash";

// ✅ GET All Organizations
export async function GET(req: Request) {
  try {
    let data;
    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const searchQuery = searchParams.get("query") || "";

    if (email) {
      data = await getOrganizationByEmail(email);
    } else {
      data = await getOrganizations(searchQuery);
    }

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
