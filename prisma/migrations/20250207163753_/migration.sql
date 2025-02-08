-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_teamId_fkey";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
