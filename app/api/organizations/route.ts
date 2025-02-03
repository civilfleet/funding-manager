import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/validations/organizations";
import { getErrorMessage } from "../helpers";
import { createOrganization } from "@/services/organizations/create";
import { z } from "zod";

const organizations = [
  { id: 1, name: "Org 1", description: "First organization" },
  { id: 2, name: "Org 2", description: "Second organization" },
];

// ✅ GET All Organizations
export async function GET() {
  return NextResponse.json(organizations);
}

// ✅ POST (Create Organization)
export async function POST(req: Request) {
  try {
    const organization = await req.json();
    console.log("organization", organization);
    const validatedData = createOrganizationSchema
      .and(z.object({ teamId: z.string().uuid() }))
      .parse({ ...organization });
    await createOrganization(validatedData);
    return NextResponse.json("reponse", { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 400, statusText: getErrorMessage(e) }
    );
  }
}
