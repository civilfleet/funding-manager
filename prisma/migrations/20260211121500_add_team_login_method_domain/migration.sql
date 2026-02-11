-- Create enum for team login routing
CREATE TYPE "LoginMethod" AS ENUM ('EMAIL_MAGIC_LINK', 'OIDC');

-- Add per-team login configuration
ALTER TABLE "Teams"
  ADD COLUMN "loginDomain" VARCHAR(255),
  ADD COLUMN "loginMethod" "LoginMethod" NOT NULL DEFAULT 'EMAIL_MAGIC_LINK';

CREATE UNIQUE INDEX "Teams_loginDomain_key" ON "Teams"("loginDomain");
