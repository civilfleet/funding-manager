"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FundingRequest, Organization } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function DetailItem({
  label,
  value,
  type = "text",
}: {
  label: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  value?: any;
  type?: string;
}) {
  if (!value) return null;

  let content = value;
  if (type === "email") {
    content = (
      <a
        href={`mailto:${value}`}
        className="text-primary hover:underline flex items-center"
      >
        <Mail className="w-4 h-4 mr-2" />
        {value}
      </a>
    );
  } else if (type === "phone") {
    content = (
      <a
        href={`tel:${value}`}
        className="text-primary hover:underline flex items-center"
      >
        <Phone className="w-4 h-4 mr-2" />
        {value}
      </a>
    );
  } else if (type === "link") {
    content = (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline flex items-center"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        {value}
      </a>
    );
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{content}</dd>
    </div>
  );
}

export default function OrganizationDetails({
  organization,
  fundingRequests,
}: {
  organization: Organization;
  fundingRequests: FundingRequest[];
}) {
  const router = useRouter();
  const users = organization?.users || [];
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "profile"
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6 max-w-4xl px-5 py-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
          <CardTitle className="text-3xl">Organization Profile</CardTitle>
        </CardHeader>
        <CardContent>
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
              </div>
              <DetailItem label="Country" value={organization.country} />
              <DetailItem
                label="Website"
                value={organization.website}
                type="link"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {organization.bankDetails && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xl">Banking Information</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection("banking")}
            >
              {expandedSection === "banking" ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CardHeader>
          <CardContent
            className={expandedSection === "banking" ? "" : "hidden"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>
      )}

      {organization.Files && organization.Files.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xl">Files</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection("files")}
            >
              {expandedSection === "files" ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CardHeader>
          <CardContent className={expandedSection === "files" ? "" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.Files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <span className="font-medium">{file?.name || file.type}</span>
                  <Button asChild variant="ghost" size="sm">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${file.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {users && users.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xl">User Persons</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection("users")}
            >
              {expandedSection === "users" ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CardHeader>
          <CardContent className={expandedSection === "users" ? "" : "hidden"}>
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${user.email}`}
                        className="text-primary hover:underline"
                      >
                        {user.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${user.phone}`}
                        className="text-primary hover:underline"
                      >
                        {user.phone}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {fundingRequests && fundingRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 ">
            <CardTitle className="text-xl ">Funding Requests</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection("funding")}
            >
              {expandedSection === "funding" ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CardHeader>
          <CardContent
            className={expandedSection === "funding" ? "" : "hidden"}
          >
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
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(`/team/funding-request/${request.id}`)
                    }
                  >
                    <TableCell className="font-medium">
                      {request.amountRequested}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "Approved"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
