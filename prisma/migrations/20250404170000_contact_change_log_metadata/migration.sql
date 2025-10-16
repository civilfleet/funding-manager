-- Add metadata column to contact change logs for storing contextual details
ALTER TABLE "ContactChangeLog"
ADD COLUMN "metadata" JSONB;

-- Add default flag to groups for module configuration
ALTER TABLE "Group"
ADD COLUMN IF NOT EXISTS "isDefaultGroup" BOOLEAN NOT NULL DEFAULT false;

-- Create AppModule enum for feature access control
DO $$ BEGIN
  CREATE TYPE "AppModule" AS ENUM ('CRM', 'FUNDING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create group module permissions table
CREATE TABLE IF NOT EXISTS "GroupModulePermission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "groupId" UUID NOT NULL,
  "module" "AppModule" NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "GroupModulePermission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupModulePermission_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroupModulePermission_groupId_module_key"
  ON "GroupModulePermission" ("groupId", "module");
CREATE INDEX IF NOT EXISTS "GroupModulePermission_groupId_idx"
  ON "GroupModulePermission" ("groupId");

-- Ensure only one default group per team (partial unique index)
DO $$ BEGIN
  CREATE UNIQUE INDEX "Group_single_default_per_team"
    ON "Group" ("teamId")
    WHERE "isDefaultGroup" = true;
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- Ensure existing groups default to access all modules
INSERT INTO "GroupModulePermission" ("groupId", "module")
SELECT g.id, m
FROM "Group" g
CROSS JOIN (VALUES ('CRM'::"AppModule"),('FUNDING'::"AppModule")) AS modules(m)
ON CONFLICT ("groupId", "module") DO NOTHING;

-- Set a default group per team if none exists
WITH ranked AS (
  SELECT id, teamId, row_number() OVER (PARTITION BY "teamId" ORDER BY "createdAt", "id") AS rn
  FROM "Group"
)
UPDATE "Group" g
SET "isDefaultGroup" = true
FROM ranked r
WHERE g.id = r.id
  AND r.rn = 1
  AND NOT EXISTS (
    SELECT 1 FROM "Group" g2 WHERE g2."teamId" = g."teamId" AND g2."isDefaultGroup" = true
  );
