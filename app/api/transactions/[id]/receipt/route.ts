import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateTransactionReceipt } from "@/services/transactions";
import { handlePrismaError } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { transactionReciept } = await request.json();
    const { id } = await params;
    const transaction = await updateTransactionReceipt(id, transactionReciept, session.user.userId);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTION_RECEIPT_PATCH]", error);
    const errorMessage = handlePrismaError(error);
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
