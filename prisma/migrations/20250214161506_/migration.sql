/*
  Warnings:

  - You are about to drop the column `organizationId` on the `ContactPerson` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `ContactPerson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContactPerson" DROP CONSTRAINT "ContactPerson_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ContactPerson" DROP CONSTRAINT "ContactPerson_teamId_fkey";

-- AlterTable
ALTER TABLE "ContactPerson" DROP COLUMN "organizationId",
DROP COLUMN "teamId";

-- CreateTable
CREATE TABLE "_TeamContacts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeamContacts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationContacts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationContacts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TeamContacts_B_index" ON "_TeamContacts"("B");

-- CreateIndex
CREATE INDEX "_OrganizationContacts_B_index" ON "_OrganizationContacts"("B");

-- AddForeignKey
ALTER TABLE "_TeamContacts" ADD CONSTRAINT "_TeamContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamContacts" ADD CONSTRAINT "_TeamContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationContacts" ADD CONSTRAINT "_OrganizationContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationContacts" ADD CONSTRAINT "_OrganizationContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
