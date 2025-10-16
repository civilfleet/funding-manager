-- Add metadata column to contact change logs for storing contextual details
ALTER TABLE "ContactChangeLog"
ADD COLUMN "metadata" JSONB;
