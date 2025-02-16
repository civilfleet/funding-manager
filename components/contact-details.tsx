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

// Reusable DetailItem component
function DetailItem({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string | number | undefined;
  type?: "text" | "email" | "phone" | "link";
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-gray-800">
        {type === "link" ? (
          <Link
            href={value as string}
            className="text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </Link>
        ) : (
          <span className="font-medium">{value || "N/A"}</span>
        )}
      </dd>
    </div>
  );
}
export default function ContactDetails({
  contact,
}: {
  contact: ContactPerson;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-6">
      {/* Organization Info */}
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Contact Profile
          </h2>
          <p className="text-gray-500">
            View and manage the details of this contact.
          </p>
        </div>

        <div className="space-y-6">
          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DetailItem label="Contact" value={contact.name} />
              <DetailItem
                label="Email Address"
                value={contact.email}
                type="email"
              />
              <DetailItem
                label="Phone Number"
                value={contact.phone}
                type="phone"
              />
            </div>

            <div className="space-y-4">
              <DetailItem label="Physical Address" value={contact.address} />
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Postal Code" value={contact.postalCode} />
                <DetailItem label="City" value={contact.city} />
                <DetailItem label="Country" value={contact.country} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
