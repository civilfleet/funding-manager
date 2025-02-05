"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Organization {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  postalCode: string;
  city: string;
  country: string;
  website: string;
  taxID: string;
  createdAt: string;
  updatedAt: string;
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    iban: string;
    bic: string;
  };
  contactPerson?: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

export default function OrganizationDetails({
  organization,
}: {
  organization: Organization;
}) {
  return (
    <div className="grid gap-6">
      {/* Organization Info */}
      <Card className="shadow-lg border border-gray-200 p-4 rounded-xl">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {organization.name || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {organization.address}
          </p>
          <p>
            <strong>Email:</strong> {organization.email}
          </p>
          <p>
            <strong>Phone:</strong> {organization.phone || "N/A"}
          </p>
          <p>
            <strong>Postal Code:</strong> {organization.postalCode}
          </p>
          <p>
            <strong>City:</strong> {organization.city}
          </p>
          <p>
            <strong>Country:</strong> {organization.country}
          </p>
          <p>
            <strong>Website:</strong> {organization.website || "N/A"}
          </p>
          <p>
            <strong>Tax ID:</strong> {organization.taxID}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(organization.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {new Date(organization.updatedAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Bank & Contact Person Details in Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank Details */}
        {organization.bankDetails && (
          <Card className="shadow-lg border border-gray-200 p-4 rounded-xl">
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank Name</TableHead>
                    <TableHead>Account Holder</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>BIC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{organization.bankDetails.bankName}</TableCell>
                    <TableCell>
                      {organization.bankDetails.accountHolder}
                    </TableCell>
                    <TableCell>{organization.bankDetails.iban}</TableCell>
                    <TableCell>{organization.bankDetails.bic}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Contact Person Details */}
        {organization.contactPerson && (
          <Card className="shadow-lg border border-gray-200 p-4 rounded-xl">
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <TableRow>
                    <TableCell>{organization.contactPerson.name}</TableCell>
                    <TableCell>{organization.contactPerson.address}</TableCell>
                    <TableCell>{organization.contactPerson.email}</TableCell>
                    <TableCell>{organization.contactPerson.phone}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {/* Contact Person Details */}
      </div>
      {organization.contactPerson && (
        <Card className="shadow-lg border border-gray-200 p-4 rounded-xl">
          <CardHeader>
            <CardTitle>Funding Requests</CardTitle>
          </CardHeader>
          <CardContent>
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
                <TableRow>
                  <TableCell>{organization.contactPerson.name}</TableCell>
                  <TableCell>{organization.contactPerson.address}</TableCell>
                  <TableCell>{organization.contactPerson.email}</TableCell>
                  <TableCell>{organization.contactPerson.phone}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
