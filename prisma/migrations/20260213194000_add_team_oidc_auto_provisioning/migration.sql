ALTER TABLE "Teams"
  ADD COLUMN "autoProvisionUsersFromOidc" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "defaultOidcGroupId" TEXT;

ALTER TABLE "Teams"
  ADD CONSTRAINT "Teams_defaultOidcGroupId_fkey"
  FOREIGN KEY ("defaultOidcGroupId") REFERENCES "Group"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Teams_defaultOidcGroupId_idx" ON "Teams"("defaultOidcGroupId");
