import { z } from "zod";
import { handlePrismaError } from "@/lib/utils";
import { NextResponse } from "next/server";
import { createEmailTemplate, getEmailTemplates, updateEmailTemplate } from "@/services/email-templates";

const emailTemplateSchema = z.object({
  name: z.string(),
  subject: z.string(),
  content: z.string(),
  type: z.string(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params;
    const templates = await getEmailTemplates(teamId);
    return NextResponse.json(templates);
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params;
    const data = await req.json();
    const validatedData = emailTemplateSchema.parse(data);
    const template = await createEmailTemplate(teamId, { ...validatedData, teamId });
    return NextResponse.json(template, { status: 201 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params;
    const data = await req.json();
    const validatedData = emailTemplateSchema.parse(data);

    const template = await updateEmailTemplate(teamId, { ...validatedData, id: data.id, teamId });

    return NextResponse.json(template);
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
