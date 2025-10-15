-- Normalize email values to lowercase
UPDATE "Contact"
SET "email" = LOWER("email")
WHERE "email" IS NOT NULL;

UPDATE "EventRegistration"
SET "email" = LOWER("email")
WHERE "email" IS NOT NULL;

DO $$
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN
    WITH ranked AS (
      SELECT
        id,
        "teamId",
        "email",
        MIN(id) OVER (PARTITION BY "teamId", "email") AS canonical_id
      FROM "Contact"
      WHERE "email" IS NOT NULL
    )
    SELECT id, canonical_id
    FROM ranked
    WHERE id <> canonical_id
  LOOP
    -- Remove duplicate contact attributes that would violate uniqueness
    DELETE FROM "ContactAttribute" ca
    WHERE ca."contactId" = dup.id
      AND EXISTS (
        SELECT 1
        FROM "ContactAttribute" ca2
        WHERE ca2."contactId" = dup.canonical_id
          AND ca2."key" = ca."key"
      );

    UPDATE "ContactAttribute"
    SET "contactId" = dup.canonical_id
    WHERE "contactId" = dup.id;

    -- Merge event contact roles, avoiding duplicates
    DELETE FROM "EventContactRole" ecr
    WHERE ecr."contactId" = dup.id
      AND EXISTS (
        SELECT 1
        FROM "EventContactRole" ecr2
        WHERE ecr2."eventId" = ecr."eventId"
          AND ecr2."contactId" = dup.canonical_id
          AND ecr2."eventRoleId" = ecr."eventRoleId"
      );

    UPDATE "EventContactRole"
    SET "contactId" = dup.canonical_id
    WHERE "contactId" = dup.id;

    -- Merge event contacts
    DELETE FROM "EventContact" ec
    WHERE ec."contactId" = dup.id
      AND EXISTS (
        SELECT 1
        FROM "EventContact" ec2
        WHERE ec2."eventId" = ec."eventId"
          AND ec2."contactId" = dup.canonical_id
      );

    UPDATE "EventContact"
    SET "contactId" = dup.canonical_id
    WHERE "contactId" = dup.id;

    -- Update remaining relations
    UPDATE "EventRegistration"
    SET "contactId" = dup.canonical_id
    WHERE "contactId" = dup.id;

    UPDATE "ContactEngagement"
    SET "contactId" = dup.canonical_id
    WHERE "contactId" = dup.id;

    UPDATE "ContactChangeLog"
    SET "contactId" = dup.canonical_id
    WHERE "contactId" = dup.id;

    -- Remove the duplicate contact
    DELETE FROM "Contact"
    WHERE id = dup.id;
  END LOOP;
END $$;

ALTER TABLE "Contact"
ADD CONSTRAINT "Contact_teamId_email_key" UNIQUE ("teamId", "email");
