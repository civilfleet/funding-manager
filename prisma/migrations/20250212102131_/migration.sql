/*
  Warnings:

  - You are about to drop the column `content` on the `File` table. All the data in the column will be lost.
  - You are about to alter the column `organizationId` on the `File` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `type` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_organizationId_fkey1";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_organizationId_fkey2";

-- DropIndex
DROP INDEX "File_organizationId_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "content",
ADD COLUMN     "type" VARCHAR(255) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
