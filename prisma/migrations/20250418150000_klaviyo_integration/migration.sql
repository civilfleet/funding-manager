-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('KLAVIYO');

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "apiKey" TEXT NOT NULL,
    "defaultListId" VARCHAR(255),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_teamId_provider_key" ON "IntegrationConnection"("teamId", "provider");

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ContactEngagement" ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "externalSource" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "ContactEngagement_teamId_externalId_externalSource_key" ON "ContactEngagement"("teamId", "externalId", "externalSource");
