import { uploadFile } from "@/services/file/s3-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const values = await req.json();
  try {
    // const response = await Promise.all(
    //   files.map(async (file) => {
    //     const Body = (await file.arrayBuffer()) as unknown as Buffer;
    //     return uploadFile({
    //       fileName: file.name,
    //       fileType: file.type,
    //     });
    //   })
    // );
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
    console.log(error);
    return new Response("Upload failed", { status: 500 });
  }
}
