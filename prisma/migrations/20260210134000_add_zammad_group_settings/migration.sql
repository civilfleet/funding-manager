-- Create table for Zammad group import settings
CREATE TABLE "ZammadGroupSetting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teamId" UUID NOT NULL,
    "groupId" INTEGER NOT NULL,
    "groupName" VARCHAR(255) NOT NULL,
    "importEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoCreateContacts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ZammadGroupSetting_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ZammadGroupSetting"
ADD CONSTRAINT "ZammadGroupSetting_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ZammadGroupSetting_teamId_groupId_key" ON "ZammadGroupSetting"("teamId", "groupId");
CREATE INDEX "ZammadGroupSetting_teamId_idx" ON "ZammadGroupSetting"("teamId");
