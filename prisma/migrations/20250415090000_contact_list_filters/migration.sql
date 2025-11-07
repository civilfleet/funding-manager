CREATE TYPE "ContactListType" AS ENUM ('MANUAL', 'SMART');

ALTER TABLE "ContactList"
ADD COLUMN     "type" "ContactListType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "filters" JSONB;

UPDATE "ContactList"
SET "type" = 'MANUAL'
WHERE "type" IS NULL;
