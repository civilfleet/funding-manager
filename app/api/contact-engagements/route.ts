import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handlePrismaError } from "@/lib/utils";
import {
  createEngagement,
  getContactEngagements,
  updateEngagement,
} from "@/services/contact-engagements";
import { EngagementDirection, EngagementSource, TodoStatus } from "@/types";

const createEngagementSchema = z.object({
  contactId: z.string().uuid(),
  teamId: z.string().uuid(),
  direction: z.enum([
    EngagementDirection.INBOUND,
    EngagementDirection.OUTBOUND,
  ]),
  source: z.enum([
    EngagementSource.EMAIL,
    EngagementSource.PHONE,
    EngagementSource.SMS,
    EngagementSource.MEETING,
    EngagementSource.EVENT,
    EngagementSource.TODO,
    EngagementSource.OTHER,
  ]),
  subject: z.string().optional(),
  message: z.string().min(1),
  userId: z.string().optional(),
  userName: z.string().optional(),
  assignedToUserId: z.string().optional(),
  assignedToUserName: z.string().optional(),
  todoStatus: z
    .enum([
      TodoStatus.PENDING,
      TodoStatus.IN_PROGRESS,
      TodoStatus.COMPLETED,
      TodoStatus.CANCELLED,
    ])
    .optional(),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  engagedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

const updateEngagementSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  subject: z.string().optional(),
  message: z.string().min(1).optional(),
  assignedToUserId: z.string().optional(),
  assignedToUserName: z.string().optional(),
  todoStatus: z
    .enum([
      TodoStatus.PENDING,
      TodoStatus.IN_PROGRESS,
      TodoStatus.COMPLETED,
      TodoStatus.CANCELLED,
    ])
    .optional(),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional()
    .nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");
    const teamId = searchParams.get("teamId");

    if (!contactId || !teamId) {
      return NextResponse.json(
        { error: "contactId and teamId are required" },
        { status: 400 },
      );
    }

    const engagements = await getContactEngagements(contactId, teamId);

    return NextResponse.json({ data: engagements }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEngagementSchema.parse(body);

    const engagement = await createEngagement({
      ...validatedData,
      engagedAt: new Date(validatedData.engagedAt),
      dueDate: validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : undefined,
    });

    return NextResponse.json({ data: engagement }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.issues },
        { status: 400 },
      );
    }

    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateEngagementSchema.parse(body);

    const engagement = await updateEngagement({
      ...validatedData,
      dueDate: validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : undefined,
    });

    return NextResponse.json({ data: engagement }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.issues },
        { status: 400 },
      );
    }

    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
