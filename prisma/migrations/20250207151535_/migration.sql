/*
  Warnings:

  - You are about to drop the column `contactPersonId` on the `Organization` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_contactPersonId_fkey";

-- DropIndex
DROP INDEX "Organization_contactPersonId_key";

-- AlterTable
ALTER TABLE "ContactPerson" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "contactPersonId";

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
