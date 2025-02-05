import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/validations/organizations";
import { getErrorMessage } from "../helpers";
import {
  createOrUpdateOrganization,
  getOrganizationByEmail,
  getOrganizations,
} from "@/services/organizations";
import { z } from "zod";

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

    console.log("response", data);
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
    console.log("organization", organization);
    const validatedData = createOrganizationSchema
      .and(z.object({ teamId: z.string().uuid() }))
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
    console.log("organization", organization);
    const validatedData = createOrganizationSchema.parse({ ...organization });
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
