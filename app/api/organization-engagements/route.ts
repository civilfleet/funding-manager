import { NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/utils";
import {
  createOrganizationEngagement,
  getOrganizationEngagements,
} from "@/services/organization-engagements";
import { createOrganizationEngagementSchema } from "@/validations/organization-engagements";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const teamId = searchParams.get("teamId");

    if (!organizationId || !teamId) {
      return NextResponse.json(
        { error: "organizationId and teamId are required" },
        { status: 400 },
      );
    }

    const engagements = await getOrganizationEngagements(
      organizationId,
      teamId,
    );
    return NextResponse.json({ data: engagements }, { status: 200 });
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
    const payload = await req.json();
    const validated = createOrganizationEngagementSchema.parse(payload);

    const engagement = await createOrganizationEngagement(validated);

    return NextResponse.json({ data: engagement }, { status: 201 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
