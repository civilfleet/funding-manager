import { NextResponse } from "next/server";
import { deleteUser, getUserById } from "@/services/users";
import { handlePrismaError } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await getUserById(params.userId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { organizationId, teamId } = await request.json();
    await deleteUser(params.userId, organizationId, teamId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 