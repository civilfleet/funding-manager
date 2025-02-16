import { NextResponse } from "next/server";
import { getErrorMessage } from "../../helpers";
import { getContactPersonById } from "@/services/contact-person";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const id = (await params).id;
    const data = await getContactPersonById(id);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
