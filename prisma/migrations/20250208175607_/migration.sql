/*
  Warnings:

  - Added the required column `submittedById` to the `FundingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FundingRequest" ADD COLUMN     "submittedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
