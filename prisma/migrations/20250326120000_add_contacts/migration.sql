-- Create enum for contact attribute types
CREATE TYPE "ContactAttributeType" AS ENUM ('STRING', 'NUMBER', 'DATE', 'LOCATION');

-- Create Contact table
CREATE TABLE "Contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teamId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- Add relation to Teams table
ALTER TABLE "Contact"
ADD CONSTRAINT "Contact_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ContactAttribute table
CREATE TABLE "ContactAttribute" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contactId" UUID NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "type" "ContactAttributeType" NOT NULL,
    "stringValue" TEXT,
    "numberValue" NUMERIC,
    "dateValue" TIMESTAMPTZ(6),
    "locationLabel" VARCHAR(255),
    "latitude" NUMERIC,
    "longitude" NUMERIC,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactAttribute_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContactAttribute_contactId_key_key" UNIQUE ("contactId", "key")
);

CREATE INDEX "ContactAttribute_key_idx" ON "ContactAttribute"("key");

ALTER TABLE "ContactAttribute"
ADD CONSTRAINT "ContactAttribute_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
