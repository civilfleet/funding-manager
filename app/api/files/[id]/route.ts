import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import s3Client from "@/lib/s3-client";
import { handlePrismaError } from "@/lib/utils";
import { canUserAccessFile, getFileById } from "@/services/file";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = (await params).id;
    if (!fileId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const hasAccess = await canUserAccessFile({
      userId: session.user.userId,
      fileId,
    });
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getFileById(fileId);
    const dataUrl = data?.url;

    const name = data?.name
      ? `${data.name}.${dataUrl?.split(".").pop() || ""}`
      : dataUrl || "unknown";

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
      Key: dataUrl,
    });

    const { Body } = await s3Client.send(command); // Get file stream

    if (!Body) throw new Error("File not found");

    return new NextResponse(Body as ReadableStream, {
      headers: {
        "Content-Disposition": `attachment; filename=${name}`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
