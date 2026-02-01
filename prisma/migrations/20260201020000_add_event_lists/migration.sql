-- Create EventList join table for linking contact lists to events
CREATE TABLE "EventList" (
  "eventId" UUID NOT NULL,
  "listId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "EventList_pkey" PRIMARY KEY ("eventId", "listId")
);

-- Foreign keys
ALTER TABLE "EventList"
  ADD CONSTRAINT "EventList_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventList"
  ADD CONSTRAINT "EventList_listId_fkey"
  FOREIGN KEY ("listId") REFERENCES "ContactList"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "EventList_eventId_idx" ON "EventList"("eventId");
CREATE INDEX "EventList_listId_idx" ON "EventList"("listId");
