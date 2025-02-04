import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/validations/organizations";
import { getErrorMessage } from "../helpers";
import {
  createOrUpdateOrganization,
  getOrganizationByEmail,
} from "@/services/organizations";
import { z } from "zod";

const organizations = [
  { id: 1, name: "Org 1", description: "First organization" },
  { id: 2, name: "Org 2", description: "Second organization" },
];

// ✅ GET All Organizations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") as string;

    const response = await getOrganizationByEmail(email);
    console.log("response", response);
    return NextResponse.json(
      {
        data: response,
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
