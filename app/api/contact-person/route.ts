import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import { getContactPersonsByOrgId } from "@/services/contact-person";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const orgId: string = searchParams.get("orgId") as string;

    const data = await getContactPersonsByOrgId(orgId);

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
