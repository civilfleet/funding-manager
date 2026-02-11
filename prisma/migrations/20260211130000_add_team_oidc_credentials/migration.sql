ALTER TABLE "Teams"
  ADD COLUMN "oidcIssuer" VARCHAR(500),
  ADD COLUMN "oidcClientId" VARCHAR(255),
  ADD COLUMN "oidcClientSecret" TEXT;
