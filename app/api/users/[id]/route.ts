import { NextResponse } from "next/server";
import { getUserById } from "@/services/users";
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
    const data = await getUserById(id);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
