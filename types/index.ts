export interface BankDetails {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  bic: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
  teams?: Teams;
}

export enum Roles {
  Organization = "Organization",
  Team = "Team",
  Admin = "Admin",
}

export interface User {
  id: string;
  name?: string;
  address?: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  organizationId?: string;
  organization?: Organization;
  fundingRequests: FundingRequest[];
  teamId?: string;
  team?: Teams;
  roles: Roles[];

  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  url: string;
  type: FileTypes;
  name: string;
  createdBy: User;
  updatedBy: User;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  organization?: Organization;
  fundingRequestId?: string;
  OrganizationTaxExemptionCertificate?: Organization;
  OrganizationArticlesOfAssociation?: Organization;
  FundingRequest?: FundingRequest;
}

export enum FundingStatus {
  Pending = "Pending",
  UnderReview = "UnderReview",
  Processing = "Processing",
  FundsTransferred = "FundsTransferred",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface FundingRequest {
  id: string;
  name: string;
  organizationId: string;
  organization: Organization;
  description: string;
  purpose: string;
  amountRequested: number;
  amountAgreed?: number;
  refinancingConcept: string;
  sustainability: string;
  expectedCompletionDate: Date;
  status: FundingStatus;
  submittedById: string;
  submittedBy?: User;

  createdAt: Date;
  updatedAt: Date;
  files: File[];
}

export interface Manager {
  id: string;
  email: string;
  name?: string;
  roles: string;
  organizations: Organization[];
}

export interface Organization {
  id: string;
  name?: string;
  address?: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  taxID?: string;
  isFilledByOrg: boolean;
  bankDetailsId?: string;
  managers: Manager[];
  users: User[];
  teamId?: string;
  team?: Teams;
  bankDetails?: BankDetails;
  fundingRequests: FundingRequest[];
  taxExemptionCertificate?: File;
  articlesOfAssociation?: File;
  createdAt: Date;
  updatedAt: Date;
  Files?: File[]; // This is a relation
}

export interface Teams {
  id: string;
  name: string;
  roleName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  bankDetailsId?: string;
  bankDetails?: BankDetails;
  organizations: Organization[];
  users: User[];
  createdAt: Date;
  updatedAt: Date;
}

export enum FileTypes {
  TAX_EXEMPTION_CERTIFICATE = "TAX_EXEMPTION_CERTIFICATE",
  ARTICLES_OF_ASSOCIATION = "ARTICLES_OF_ASSOCIATION",
  REPORT = "REPORT",
  LOGO = "LOGO",
  DONATION_AGREEMENT = "DONATION_AGREEMENT",
  DONATION_RECEIPT = "DONATION_RECEIPT",
  STATEMENT = "STATEMENT",
}

export type DonationAgreementSignature = {
  id: string;
  userId: string;
  user: User;
  agreementId: string;
  agreement: DonationAgreement;
  signature: string;
  signedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
export type DonationAgreement = {
  id: string;
  fundingRequestId: string;
  description: string;
  fileId: string;
  agreement: string;
  createdAt: Date;
  updatedAt: Date;
  userSignatures: DonationAgreementSignature[];
  fundingRequest?: FundingRequest; // Optional relation
  file?: File; // Optional relation
  createdBy: User;
  createdById: string;
};

export type EMAIL_CONTENT = {
  from?: string;
  to: string;
  subject: string;
  template: string;
};
