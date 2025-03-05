import { uploadFile } from "@/services/file/s3-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const values = await req.json();
  try {
    const putUrl = await uploadFile({
      fileName: values.fileName,
      fileType: values.fileType,
    });
    if (!putUrl) {
      return new Response("Upload failed", { status: 500 });
    }

    return NextResponse.json(
      {
        putUrl,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);

    return new Response(JSON.stringify(error), { status: 500 });
  }
}
