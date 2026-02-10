-- Add Zammad integration provider and connection metadata
ALTER TYPE "IntegrationProvider" ADD VALUE 'ZAMMAD';

ALTER TABLE "IntegrationConnection"
ADD COLUMN "baseUrl" VARCHAR(500),
ADD COLUMN "webhookSecret" TEXT;
