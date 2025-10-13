import { notFound } from "next/navigation";
import { getContactById } from "@/services/contacts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar, MapPin, Hash, Type, CalendarDays } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ContactAttributeType } from "@/types";
import ContactEngagementHistory from "@/components/contact-engagement-history";
import ContactChangeHistory from "@/components/contact-change-history";

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

        {/* Associated Events */}
        <Card className="w-full shadow-sm mt-6">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Associated Events</CardTitle>
            </div>
            <CardDescription>Events this contact is participating in</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {contact.events && contact.events.length > 0 ? (
              <div className="space-y-4">
                {contact.events.map((contactEvent) => (
                  <Link
                    key={contactEvent.event.id}
                    href={`/teams/${teamId}/events/${contactEvent.event.id}`}
                    className="block p-4 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-semibold text-base">{contactEvent.event.title}</h4>
                          {contactEvent.event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {contactEvent.event.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(contactEvent.event.startDate), "PPP")}</span>
                          </div>
                          {contactEvent.event.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span>{contactEvent.event.location}</span>
                            </div>
                          )}
                        </div>

                        {contactEvent.roles && contactEvent.roles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {contactEvent.roles.map((role, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                style={
                                  role.eventRole.color
                                    ? {
                                        backgroundColor: `${role.eventRole.color}20`,
                                        color: role.eventRole.color,
                                        borderColor: role.eventRole.color,
                                      }
                                    : undefined
                                }
                              >
                                {role.eventRole.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No associated events yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Engagement History */}
        <div className="mt-6">
          <ContactEngagementHistory contactId={id} teamId={teamId} />
        </div>

        {/* Change History */}
        <div className="mt-6">
          <ContactChangeHistory contactId={id} />
        </div>
      </div>
    </div>
  );
}
