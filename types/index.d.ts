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

export interface ContactPerson {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  content: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  fundingRequestId?: string;
  OrganizationTaxExemptionCertificate?: Organization;
  OrganizationArticlesOfAssociation?: Organization;
  FundingRequest?: FundingRequest;
}

export enum FundingStatus {
  Pending = "Pending",
  UnderReview = "UnderReview",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface FundingRequest {
  id: string;
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
  submittedBy?: ContactPerson;
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
  contacts: ContactPerson[];
  teamId?: string;
  team?: Teams;
  bankDetails?: BankDetails;
  fundingRequests: FundingRequest[];
  taxExemptionCertificate?: File;
  articlesOfAssociation?: File;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teams {
  id: string;
  name: string;
  roleName: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  bankDetailsId?: string;
  bankDetails?: BankDetails;
  organizations: Organization[];
  createdAt: Date;
  updatedAt: Date;
}
