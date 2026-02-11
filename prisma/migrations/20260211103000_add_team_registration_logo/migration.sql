-- Add optional logo key shown on the public registration page
ALTER TABLE "Teams"
ADD COLUMN "registrationPageLogoKey" VARCHAR(255);
