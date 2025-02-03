/*
  Warnings:

  - You are about to drop the `_OrganizationToTeams` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teamId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_OrganizationToTeams" DROP CONSTRAINT "_OrganizationToTeams_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToTeams" DROP CONSTRAINT "_OrganizationToTeams_B_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "teamId" TEXT;

-- DropTable
DROP TABLE "_OrganizationToTeams";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_teamId_key" ON "Organization"("teamId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
