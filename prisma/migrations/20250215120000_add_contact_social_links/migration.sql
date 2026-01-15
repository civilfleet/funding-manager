CREATE TABLE "ContactSocialLink" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contactId" UUID NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "handle" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactSocialLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactSocialLink_contactId_platform_key" ON "ContactSocialLink"("contactId", "platform");
CREATE INDEX "ContactSocialLink_contactId_idx" ON "ContactSocialLink"("contactId");

ALTER TABLE "ContactSocialLink"
ADD CONSTRAINT "ContactSocialLink_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
