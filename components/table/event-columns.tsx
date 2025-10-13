import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";

export type EventRow = {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  contacts: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return "—";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value instanceof Date ? value.toISOString() : value;
  }

  return format(parsed, "PP");
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "—";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value instanceof Date ? value.toISOString() : value;
  }

  return format(parsed, "PPp");
};

const renderContacts = (contacts: EventRow["contacts"] = []) => {
  if (!contacts.length) {
    return <span className="text-muted-foreground">No contacts</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {contacts.slice(0, 3).map((contact) => (
        <Badge key={contact.id} variant="secondary" className="text-xs font-normal">
          {contact.name}
        </Badge>
      ))}
      {contacts.length > 3 && (
        <Badge variant="secondary" className="text-xs font-normal">
          +{contacts.length - 3} more
        </Badge>
      )}
    </div>
  );
};

const EventTitleCell = ({ event }: { event: EventRow }) => {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <Link href={`/teams/${teamId}/events/${event.id}`} className="font-medium hover:underline">
      {event.title}
    </Link>
  );
};

export const eventColumns: ColumnDef<EventRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <EventTitleCell event={row.original} />,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <span>{row.original.location || "—"}</span>,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => <span>{formatDateTime(row.original.startDate)}</span>,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => <span>{formatDateTime(row.original.endDate)}</span>,
  },
  {
    accessorKey: "contacts",
    header: "Contacts",
    cell: ({ row }) => renderContacts(row.original.contacts),
  },
];

export const renderEventCard = (event: EventRow) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
      <div>
        <h3 className="text-base font-semibold">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>

      <div className="space-y-1 text-sm">
        {event.location && (
          <p className="text-muted-foreground">
            <span className="font-medium">Location:</span> {event.location}
          </p>
        )}
        <p className="text-muted-foreground">
          <span className="font-medium">Start:</span> {formatDateTime(event.startDate)}
        </p>
        {event.endDate && (
          <p className="text-muted-foreground">
            <span className="font-medium">End:</span> {formatDateTime(event.endDate)}
          </p>
        )}
      </div>

      {event.contacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Contacts</p>
          {renderContacts(event.contacts)}
        </div>
      )}
    </div>
  );
};
