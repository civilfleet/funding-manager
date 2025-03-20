/*
  Warnings:

  - You are about to drop the column `roleName` on the `Teams` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Teams_roleName_key";

-- AlterTable
ALTER TABLE "Teams" DROP COLUMN "roleName";
