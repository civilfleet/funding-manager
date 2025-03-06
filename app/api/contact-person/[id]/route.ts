import { NextResponse } from "next/server";
import { getContactPersonById } from "@/services/contact-person";
import { handlePrismaError } from "@/lib/utils";

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
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
