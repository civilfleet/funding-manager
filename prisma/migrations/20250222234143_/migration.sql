-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('Pending', 'UnderReview', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('Organization', 'Team', 'Admin');

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
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "postalCode" VARCHAR(255),
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "website" VARCHAR(255),
    "taxID" VARCHAR(255),
    "isFilledByOrg" BOOLEAN NOT NULL DEFAULT false,
    "bankDetailsId" TEXT,
    "teamId" TEXT,
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
    "purpose" TEXT NOT NULL,
    "amountRequested" DECIMAL(65,30) NOT NULL,
    "amountAgreed" DECIMAL(65,30),
    "refinancingConcept" TEXT NOT NULL,
    "sustainability" TEXT NOT NULL,
    "expectedCompletionDate" TIMESTAMP(3) NOT NULL,
    "status" "FundingStatus" NOT NULL DEFAULT 'Pending',
    "submittedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "FundingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "url" TEXT NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" VARCHAR(255),
    "fundingRequestId" TEXT,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "address" VARCHAR(255),
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
CREATE TABLE "ContactPerson" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "address" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "postalCode" VARCHAR(255),
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "type" "ContactType" NOT NULL DEFAULT 'Organization',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationAgreement" (
    "id" TEXT NOT NULL,
    "fundingRequestId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "agreement" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DonationAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationAgreementSignature" (
    "donationAgreementId" TEXT NOT NULL,
    "contactPersonId" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "DonationAgreementSignature_pkey" PRIMARY KEY ("donationAgreementId","contactPersonId")
);

-- CreateTable
CREATE TABLE "_ManagerToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManagerToOrganization_AB_pkey" PRIMARY KEY ("A","B")
);

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
CREATE UNIQUE INDEX "Manager_id_key" ON "Manager"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_email_key" ON "Manager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_id_key" ON "Organization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_bankDetailsId_key" ON "Organization"("bankDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_id_key" ON "BankDetails"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_iban_key" ON "BankDetails"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "FundingRequest_id_key" ON "FundingRequest"("id");

-- CreateIndex
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");

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
CREATE UNIQUE INDEX "ContactPerson_id_key" ON "ContactPerson"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPerson_email_key" ON "ContactPerson"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DonationAgreement_id_key" ON "DonationAgreement"("id");

-- CreateIndex
CREATE INDEX "_ManagerToOrganization_B_index" ON "_ManagerToOrganization"("B");

-- CreateIndex
CREATE INDEX "_TeamContacts_B_index" ON "_TeamContacts"("B");

-- CreateIndex
CREATE INDEX "_OrganizationContacts_B_index" ON "_OrganizationContacts"("B");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_bankDetailsId_fkey" FOREIGN KEY ("bankDetailsId") REFERENCES "BankDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_fundingRequestId_fkey" FOREIGN KEY ("fundingRequestId") REFERENCES "FundingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teams" ADD CONSTRAINT "Teams_bankDetailsId_fkey" FOREIGN KEY ("bankDetailsId") REFERENCES "BankDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationAgreement" ADD CONSTRAINT "DonationAgreement_fundingRequestId_fkey" FOREIGN KEY ("fundingRequestId") REFERENCES "FundingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationAgreement" ADD CONSTRAINT "DonationAgreement_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationAgreement" ADD CONSTRAINT "DonationAgreement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationAgreementSignature" ADD CONSTRAINT "DonationAgreementSignature_donationAgreementId_fkey" FOREIGN KEY ("donationAgreementId") REFERENCES "DonationAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationAgreementSignature" ADD CONSTRAINT "DonationAgreementSignature_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerToOrganization" ADD CONSTRAINT "_ManagerToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerToOrganization" ADD CONSTRAINT "_ManagerToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamContacts" ADD CONSTRAINT "_TeamContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamContacts" ADD CONSTRAINT "_TeamContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationContacts" ADD CONSTRAINT "_OrganizationContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationContacts" ADD CONSTRAINT "_OrganizationContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
