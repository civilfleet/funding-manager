import { NextResponse } from "next/server";

import { getFileById } from "@/services/file";
import s3Client from "@/lib/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
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
    const fileId = (await params).id;
    if (!fileId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
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
        "Content-Disposition": "attachment; filename=" + name,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
