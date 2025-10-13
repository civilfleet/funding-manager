import { notFound } from "next/navigation";
import { getContactById } from "@/services/contacts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar, MapPin, Hash, Type } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ContactAttributeType } from "@/types";
import ContactEngagementHistory from "@/components/contact-engagement-history";

interface ContactDetailPageProps {
  params: Promise<{
    teamId: string;
    id: string;
  }>;
}

const formatAttributeValue = (type: ContactAttributeType, value: unknown) => {
  switch (type) {
    case ContactAttributeType.STRING:
      return value as string;
    case ContactAttributeType.NUMBER:
      return (value as number).toLocaleString();
    case ContactAttributeType.DATE:
      if (typeof value === "string") {
        try {
          return format(new Date(value), "PPP");
        } catch {
          return value;
        }
      }
      return value as string;
    case ContactAttributeType.LOCATION:
      if (typeof value === "object" && value !== null) {
        const loc = value as { label?: string; latitude?: number; longitude?: number };
        const parts = [];
        if (loc.label) parts.push(loc.label);
        if (loc.latitude !== undefined && loc.longitude !== undefined) {
          parts.push(`(${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)})`);
        }
        return parts.join(" ");
      }
      return String(value);
    default:
      return String(value);
  }
};

const getAttributeIcon = (type: ContactAttributeType) => {
  switch (type) {
    case ContactAttributeType.STRING:
      return Type;
    case ContactAttributeType.NUMBER:
      return Hash;
    case ContactAttributeType.DATE:
      return Calendar;
    case ContactAttributeType.LOCATION:
      return MapPin;
    default:
      return Type;
  }
};

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { teamId, id } = await params;
  const contact = await getContactById(id, teamId);

  if (!contact) {
    notFound();
  }

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="w-full shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">{contact.name}</CardTitle>
                <CardDescription>Contact Details</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/teams/${teamId}/contacts/${id}/edit`}>Edit Contact</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Core contact details</p>
              </div>

              <div className="grid gap-4">
                {contact.email && (
                  <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-base hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <a href={`tel:${contact.phone}`} className="text-base hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {!contact.email && !contact.phone && (
                  <p className="text-sm text-muted-foreground p-3 rounded-md border border-dashed text-center">
                    No contact information available
                  </p>
                )}
              </div>
            </div>

            {/* Profile Attributes */}
            {contact.profileAttributes && contact.profileAttributes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold">Profile Attributes</h3>
                    <p className="text-sm text-muted-foreground">Additional information about this contact</p>
                  </div>

                  <div className="space-y-3">
                    {contact.profileAttributes.map((attribute, index) => {
                      const Icon = getAttributeIcon(attribute.type);
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-md border bg-muted/30">
                          <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{attribute.key}</p>
                              <Badge variant="outline" className="text-xs">
                                {attribute.type}
                              </Badge>
                            </div>
                            <p className="text-base">{formatAttributeValue(attribute.type, attribute.value)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Metadata</h3>
                <p className="text-sm text-muted-foreground">Contact creation and update information</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-3 rounded-md border bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-base">{format(new Date(contact.createdAt), "PPpp")}</p>
                </div>
                <div className="p-3 rounded-md border bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-base">{format(new Date(contact.updatedAt), "PPpp")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement History */}
        <div className="mt-6">
          <ContactEngagementHistory contactId={id} teamId={teamId} />
        </div>
      </div>
    </div>
  );
}
