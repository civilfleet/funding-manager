"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FundingRequest, Organization } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DetailItem from "./detail-item";

export default function OrganizationDetails({
  organization,
  fundingRequests,
}: {
  organization: Organization;
  fundingRequests: FundingRequest[];
}) {
  const router = useRouter();
  const contacts = organization?.contactPersons || [];
  return (
    <div className="grid gap-6">
      {/* Organization Info */}
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Organization Profile
          </h2>
          <p className="text-gray-500">Basic information and banking details</p>
        </div>

        <div className="space-y-6">
          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DetailItem label="Organization Name" value={organization.name} />
              <DetailItem
                label="Email Address"
                value={organization.email}
                type="email"
              />
              <DetailItem
                label="Phone Number"
                value={organization.phone}
                type="phone"
              />
              <DetailItem
                label="Tax Identification"
                value={organization.taxID}
              />
            </div>

            <div className="space-y-4">
              <DetailItem
                label="Physical Address"
                value={organization.address}
              />
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Postal Code"
                  value={organization.postalCode}
                />
                <DetailItem label="City" value={organization.city} />
                <DetailItem label="Country" value={organization.country} />
              </div>
              <DetailItem
                label="Website"
                value={organization.website}
                type="link"
              />
            </div>
          </div>

          {/* Bank Details */}
          {organization.bankDetails && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Banking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-lg">
                <DetailItem
                  label="Bank Name"
                  value={organization.bankDetails.bankName}
                />
                <DetailItem
                  label="Account Holder"
                  value={organization.bankDetails.accountHolder}
                />
                <DetailItem
                  label="IBAN Number"
                  value={organization.bankDetails.iban}
                />
                <DetailItem
                  label="BIC/SWIFT"
                  value={organization.bankDetails.bic}
                />
              </div>
            </div>
          )}
          {organization.Files && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Files
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-lg">
                {organization.Files.map((file) => (
                  <div key={file.id}>
                    <DetailItem
                      key={file.id}
                      label={file.type}
                      value={``}
                      type="link"
                    />
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${file.id}`}
                    >
                      <span className="text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline">
                        Download
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {contacts && (
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Contact Persons
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.address}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {fundingRequests && (
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Funding Requests
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundingRequests.map((request) => (
                <TableRow
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    router.push(`/team/funding-request/${request.id}`)
                  }
                  key={request.id}
                >
                  <TableCell>{request.amountRequested}</TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell>{request.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
