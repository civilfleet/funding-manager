import { S3, S3ClientConfig } from "@aws-sdk/client-s3";

interface S3ClientCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

const s3ClientConfig: S3ClientConfig = {
  forcePathStyle: true,
  endpoint: process.env.NEXT_AWS_S3_ENDPOINT,
  region: process.env.NEXT_AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.NEXT_AWS_S3_ACCESS_SECRET as string,
  } as S3ClientCredentials,
};

const s3Client = new S3(s3ClientConfig);

export default s3Client;
