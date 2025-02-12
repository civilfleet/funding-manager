// Filename: s3Service.ts

import s3Client from "@/lib/s3-client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const uploadFile = async ({
  fileName,
  fileType,
}: {
  fileName: string;
  fileType: string;
}) => {
  try {
    console.log("fileName", process.env.NEXT_AWS_S3_BUCKET_NAME);
    const command = new PutObjectCommand({
      Key: `${fileName}`,
      ContentType: fileType,
      Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
    });

    // Generate pre-signed PUT URL
    const putUrl = await getSignedUrl(s3Client, command, { expiresIn: 500 });

    return putUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
};
