-- Add ContactFieldAccess table for per-group field visibility
CREATE TABLE "ContactFieldAccess" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teamId" UUID NOT NULL,
    "fieldKey" VARCHAR(255) NOT NULL,
    "groupId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "ContactFieldAccess_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactFieldAccess_teamId_fieldKey_groupId_key" ON "ContactFieldAccess"("teamId", "fieldKey", "groupId");
CREATE INDEX "ContactFieldAccess_teamId_fieldKey_idx" ON "ContactFieldAccess"("teamId", "fieldKey");
CREATE INDEX "ContactFieldAccess_groupId_idx" ON "ContactFieldAccess"("groupId");

ALTER TABLE "ContactFieldAccess"
ADD CONSTRAINT "ContactFieldAccess_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactFieldAccess"
ADD CONSTRAINT "ContactFieldAccess_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
