/*
  Warnings:

  - You are about to drop the column `createdBy` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `File` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
