ALTER TABLE "Teams"
  ADD COLUMN "domainVerificationToken" VARCHAR(255),
  ADD COLUMN "domainVerifiedAt" TIMESTAMPTZ(6),
  ADD COLUMN "domainLastCheckedAt" TIMESTAMPTZ(6);

DROP INDEX IF EXISTS "Teams_loginDomain_key";

CREATE UNIQUE INDEX "Teams_verified_loginDomain_key"
ON "Teams"("loginDomain")
WHERE "loginDomain" IS NOT NULL AND "domainVerifiedAt" IS NOT NULL;
