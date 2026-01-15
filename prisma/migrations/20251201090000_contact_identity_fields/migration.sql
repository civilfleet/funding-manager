CREATE TYPE "ContactGender" AS ENUM ('FEMALE', 'MALE', 'NON_BINARY', 'OTHER', 'NO_ANSWER');
CREATE TYPE "ContactRequestPreference" AS ENUM ('YES', 'NO', 'NO_ANSWER');

-- Extend contacts with identity, preference, and scheduling metadata
ALTER TABLE "Contact"
ADD COLUMN "gender" "ContactGender",
ADD COLUMN "genderRequestPreference" "ContactRequestPreference",
ADD COLUMN "isBipoc" BOOLEAN,
ADD COLUMN "racismRequestPreference" "ContactRequestPreference",
ADD COLUMN "otherMargins" TEXT,
ADD COLUMN "onboardingDate" TIMESTAMPTZ(6),
ADD COLUMN "breakUntil" TIMESTAMPTZ(6);
