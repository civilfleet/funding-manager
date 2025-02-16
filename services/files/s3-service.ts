// Filename: s3Service.ts

import s3Client from "@/lib/s3-client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { cleanFileName } from "@/lib/utils";

export const uploadFile = async ({
  fileName,
  fileType,
}: {
  fileName: string;
  fileType: string;
}) => {
  try {
    fileName = cleanFileName(fileName);
    fileName = `${new Date().getTime()}-${fileName}`;

    const command = new PutObjectCommand({
      Key: `${fileName}`,
      ContentType: fileType,
      Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
    });

    // Generate pre-signed PUT URL
    const putUrl = await getSignedUrl(s3Client, command, { expiresIn: 500 });

    return putUrl;
  } catch (error) {
    throw new Error("Error uploading file");
  }
};
