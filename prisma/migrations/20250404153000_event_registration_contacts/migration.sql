ALTER TABLE "EventRegistration"
ADD COLUMN "contactId" TEXT;

DO $$
DECLARE
  reg RECORD;
  matched_contact_id TEXT;
BEGIN
  FOR reg IN
    SELECT er.id,
           er.name,
           er.email,
           er.phone,
           er."eventId",
           e."teamId"
    FROM "EventRegistration" er
    INNER JOIN "Event" e ON e.id = er."eventId"
  LOOP
    matched_contact_id := NULL;

    IF reg.email IS NOT NULL THEN
      SELECT c.id INTO matched_contact_id
      FROM "Contact" c
      WHERE c."teamId" = reg."teamId"
        AND c.email IS NOT NULL
        AND LOWER(c.email) = LOWER(reg.email)
      LIMIT 1;
    END IF;

    IF matched_contact_id IS NULL AND reg.phone IS NOT NULL THEN
      SELECT c.id INTO matched_contact_id
      FROM "Contact" c
      WHERE c."teamId" = reg."teamId"
        AND c.phone IS NOT NULL
        AND c.phone = reg.phone
      LIMIT 1;
    END IF;

    IF matched_contact_id IS NULL THEN
      INSERT INTO "Contact" ("teamId", "name", "email", "phone", "createdAt", "updatedAt")
      VALUES (
        reg."teamId",
        reg.name,
        reg.email,
        reg.phone,
        NOW(),
        NOW()
      )
      RETURNING id INTO matched_contact_id;
    ELSE
      UPDATE "Contact"
      SET
        name = CASE
          WHEN name IS NULL OR btrim(name) = '' THEN reg.name
          ELSE name
        END,
        email = CASE
          WHEN email IS NULL AND reg.email IS NOT NULL THEN reg.email
          ELSE email
        END,
        phone = CASE
          WHEN phone IS NULL AND reg.phone IS NOT NULL THEN reg.phone
          ELSE phone
        END,
        "updatedAt" = NOW()
      WHERE id = matched_contact_id;
    END IF;

    UPDATE "EventRegistration"
    SET "contactId" = matched_contact_id
    WHERE id = reg.id;
  END LOOP;
END $$;

ALTER TABLE "EventRegistration"
ALTER COLUMN "contactId" SET NOT NULL;

ALTER TABLE "EventRegistration"
ADD CONSTRAINT "EventRegistration_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE;

CREATE INDEX "EventRegistration_contactId_idx"
ON "EventRegistration"("contactId");
