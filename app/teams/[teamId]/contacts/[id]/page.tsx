import { format } from "date-fns";
import {
  Calendar,
  CalendarDays,
  Hash,
  Mail,
  MapPin,
  Phone,
  Type,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactChangeHistory from "@/components/contact-change-history";
import ContactEngagementHistory from "@/components/contact-engagement-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContactById } from "@/services/contacts";
import { ContactAttributeType } from "@/types";

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
        const loc = value as {
          label?: string;
          latitude?: number;
          longitude?: number;
        };
        const parts = [];
        if (loc.label) parts.push(loc.label);
        if (loc.latitude !== undefined && loc.longitude !== undefined) {
          parts.push(
            `(${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)})`,
          );
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

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
  const { teamId, id } = await params;
  const contact = await getContactById(id, teamId);

  if (!contact) {
    notFound();
  }

  return (
    <div className="p-4">
      <div className="mx-auto w-full">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-8">
            <Card className="w-full shadow-sm">
              <CardHeader className="border-b pb-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {contact.name}
                    </CardTitle>
                    <CardDescription>Contact Details</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/teams/${teamId}/contacts/${id}/edit`}>
                      Edit Contact
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold">
                        Basic Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Core contact details
                      </p>
                    </div>

                    {(() => {
                      const infoItems = [
                        contact.email && {
                          icon: Mail,
                          label: "Email",
                          value: contact.email,
                          href: `mailto:${contact.email}`,
                        },
                        contact.phone && {
                          icon: Phone,
                          label: "Phone",
                          value: contact.phone,
                          href: `tel:${contact.phone}`,
                        },
                        contact.pronouns && {
                          icon: Type,
                          label: "Pronouns",
                          value: contact.pronouns,
                        },
                        contact.city && {
                          icon: MapPin,
                          label: "City",
                          value: contact.city,
                        },
                      ].filter(Boolean) as Array<{
                        icon: typeof Mail;
                        label: string;
                        value: string;
                        href?: string;
                      }>;

                      if (infoItems.length === 0) {
                        return (
                          <p className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                            No contact information available
                          </p>
                        );
                      }

                      return (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {infoItems.map(({ icon: Icon, label, value, href }) => (
                            <div
                              key={label}
                              className="flex items-center gap-3 rounded-md border bg-muted/30 p-3"
                            >
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  {label}
                                </p>
                                {href ? (
                                  <a href={href} className="text-base hover:underline">
                                    {value}
                                  </a>
                                ) : (
                                  <p className="text-base">{value}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold">Metadata</h3>
                      <p className="text-sm text-muted-foreground">
                        Contact lifecycle details
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {contact.group && (
                        <div className="rounded-md border bg-muted/30 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">
                              Group
                            </p>
                          </div>
                          <p className="text-base">{contact.group.name}</p>
                          {contact.group.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {contact.group.description}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Created At
                        </p>
                        <p className="text-base">
                          {format(new Date(contact.createdAt), "PPpp")}
                        </p>
                      </div>
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </p>
                        <p className="text-base">
                          {format(new Date(contact.updatedAt), "PPpp")}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>

            {contact.profileAttributes.length > 0 && (
              <Card className="w-full shadow-sm">
                <CardHeader className="border-b pb-3">
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      Profile Attributes
                    </CardTitle>
                    <CardDescription>
                      Additional information about this contact
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contact.profileAttributes.map((attribute) => {
                      const Icon = getAttributeIcon(attribute.type);
                      return (
                        <div
                          key={`${attribute.key}-${attribute.type}`}
                          className="flex items-start gap-3 rounded-md border bg-muted/30 p-3"
                        >
                          <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {attribute.key}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {attribute.type}
                              </Badge>
                            </div>
                            <p className="text-base">
                              {formatAttributeValue(
                                attribute.type,
                                attribute.value,
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <ContactEngagementHistory contactId={id} teamId={teamId} />
          </div>

          <div className="space-y-6 lg:col-span-4 lg:col-start-9">
            <ContactChangeHistory contactId={id} />
            <Card className="w-full shadow-sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  <CardTitle className="text-xl font-semibold">
                    Associated Events
                  </CardTitle>
                </div>
                <CardDescription>
                  Events this contact is participating in
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                {contact.events && contact.events.length > 0 ? (
                  <div className="grid gap-4">
                    {contact.events.map((contactEvent) => (
                      <Link
                        key={contactEvent.event.id}
                        href={`/teams/${teamId}/events/${contactEvent.event.id}`}
                        className="block h-full rounded-md border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h4 className="text-base font-semibold">
                              {contactEvent.event.title}
                            </h4>
                            {contactEvent.event.description && (
                              <p className="text-sm text-muted-foreground">
                                {contactEvent.event.description}
                              </p>
                            )}
                          </div>

                          {contactEvent.participationTypes?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {contactEvent.participationTypes.includes(
                                "linked",
                              ) && (
                                <Badge variant="outline">Linked contact</Badge>
                              )}
                              {contactEvent.participationTypes.includes(
                                "registered",
                              ) && (
                                <Badge variant="outline">
                                  Registered attendee
                                </Badge>
                              )}
                            </div>
                          ) : null}

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(contactEvent.event.startDate),
                                  "PPP",
                                )}
                              </span>
                            </div>
                            {contactEvent.event.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>{contactEvent.event.location}</span>
                              </div>
                            )}
                          </div>

                          {contactEvent.roles &&
                            contactEvent.roles.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {contactEvent.roles.map((role) => (
                                  <Badge
                                    key={`${contactEvent.event.id}-${role.eventRole.id}`}
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

                          {contactEvent.registration && (
                            <p className="text-xs text-muted-foreground">
                              Registered on{" "}
                              {format(
                                new Date(contactEvent.registration.createdAt),
                                "PPpp",
                              )}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No associated events yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
