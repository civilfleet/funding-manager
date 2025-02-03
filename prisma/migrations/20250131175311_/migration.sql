-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('Pending', 'UnderReview', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "Teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "postalCode" VARCHAR(255),
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "website" VARCHAR(255),
    "bankDetailsId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "roles" TEXT NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "address" VARCHAR(255),
    "contactPersonId" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "postalCode" VARCHAR(255),
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "website" VARCHAR(255),
    "taxID" VARCHAR(255),
    "bankDetailsId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" TEXT NOT NULL,
    "bankName" VARCHAR(255) NOT NULL,
    "accountHolder" VARCHAR(255) NOT NULL,
    "iban" VARCHAR(255) NOT NULL,
    "bic" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" VARCHAR(255) NOT NULL,
    "amountRequested" DECIMAL(65,30) NOT NULL,
    "amountAgreed" DECIMAL(65,30) NOT NULL,
    "refinancingConcept" VARCHAR(255) NOT NULL,
    "sustainability" VARCHAR(255) NOT NULL,
    "expectedCompletionDate" TIMESTAMP(3) NOT NULL,
    "status" "FundingStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FundingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "updatedBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" TEXT,
    "fundingRequestId" TEXT,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "address" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "postalCode" VARCHAR(255),
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ManagerToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManagerToOrganization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationToTeams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationToTeams_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teams_id_key" ON "Teams"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Teams_name_key" ON "Teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Teams_roleName_key" ON "Teams"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "Teams_email_key" ON "Teams"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teams_bankDetailsId_key" ON "Teams"("bankDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_id_key" ON "Manager"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_email_key" ON "Manager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_id_key" ON "Organization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_contactPersonId_key" ON "Organization"("contactPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_bankDetailsId_key" ON "Organization"("bankDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_id_key" ON "BankDetails"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FundingRequest_id_key" ON "FundingRequest"("id");

-- CreateIndex
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");

-- CreateIndex
CREATE UNIQUE INDEX "File_organizationId_key" ON "File"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPerson_id_key" ON "ContactPerson"("id");

-- CreateIndex
CREATE INDEX "_ManagerToOrganization_B_index" ON "_ManagerToOrganization"("B");

-- CreateIndex
CREATE INDEX "_OrganizationToTeams_B_index" ON "_OrganizationToTeams"("B");

-- AddForeignKey
ALTER TABLE "Teams" ADD CONSTRAINT "Teams_bankDetailsId_fkey" FOREIGN KEY ("bankDetailsId") REFERENCES "BankDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_bankDetailsId_fkey" FOREIGN KEY ("bankDetailsId") REFERENCES "BankDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_organizationId_fkey1" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_organizationId_fkey2" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_fundingRequestId_fkey" FOREIGN KEY ("fundingRequestId") REFERENCES "FundingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerToOrganization" ADD CONSTRAINT "_ManagerToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerToOrganization" ADD CONSTRAINT "_ManagerToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTeams" ADD CONSTRAINT "_OrganizationToTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTeams" ADD CONSTRAINT "_OrganizationToTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
