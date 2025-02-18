import { NextResponse } from "next/server";
import { getErrorMessage } from "../../helpers";
import { getFileById } from "@/services/file";
import s3Client from "@/lib/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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
      Bucket: "funding-manager-civilfleet",
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
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
