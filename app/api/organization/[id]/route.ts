import { NextResponse } from "next/server";
import { getOrganizationById } from "@/services/organizations";
import { getErrorMessage } from "../../helpers";
import { auth } from "@/auth";

// ✅ GET Organization by ID
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await auth();
    console.log(session);
    const organizationId = (await params).id;
    if (!organizationId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await getOrganizationById(organizationId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
