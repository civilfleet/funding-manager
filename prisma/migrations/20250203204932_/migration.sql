/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,email]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Made the column `teamId` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_teamId_fkey";

-- DropIndex
DROP INDEX "Organization_teamId_key";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "teamId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_email_key" ON "Organization"("name", "email");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
