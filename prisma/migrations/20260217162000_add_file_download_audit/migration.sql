CREATE TYPE "FileDownloadType" AS ENUM ('SINGLE', 'BULK');

CREATE TABLE "FileDownloadAudit" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "FileDownloadType" NOT NULL,
  "fileCount" INTEGER NOT NULL DEFAULT 1,
  "query" TEXT,
  "userId" UUID NOT NULL,
  "fileId" UUID,
  "teamId" UUID,
  "organizationId" UUID,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FileDownloadAudit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FileDownloadAudit"
  ADD CONSTRAINT "FileDownloadAudit_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FileDownloadAudit"
  ADD CONSTRAINT "FileDownloadAudit_fileId_fkey"
  FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileDownloadAudit"
  ADD CONSTRAINT "FileDownloadAudit_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileDownloadAudit"
  ADD CONSTRAINT "FileDownloadAudit_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FileDownloadAudit_teamId_createdAt_idx" ON "FileDownloadAudit"("teamId", "createdAt");
CREATE INDEX "FileDownloadAudit_organizationId_createdAt_idx" ON "FileDownloadAudit"("organizationId", "createdAt");
CREATE INDEX "FileDownloadAudit_fileId_createdAt_idx" ON "FileDownloadAudit"("fileId", "createdAt");
CREATE INDEX "FileDownloadAudit_userId_createdAt_idx" ON "FileDownloadAudit"("userId", "createdAt");
