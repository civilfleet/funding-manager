import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const fieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const formFieldSchema = z.object({
  id: z.string().optional(),
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  type: z.enum(["TEXT", "TEXTAREA", "NUMBER", "DATE", "EMAIL", "URL", "SELECT", "MULTISELECT", "CHECKBOX", "RADIO", "FILE"]),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  isRequired: z.boolean(),
  order: z.number(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  pattern: z.string().optional(),
  options: z.array(fieldOptionSchema).optional(),
});

const formSectionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number(),
  fields: z.array(formFieldSchema),
});

const formConfigSchema = z.object({
  sections: z.array(formSectionSchema),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    const { teamId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this team or is an admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { teams: true },
    });

    const isAdmin = user?.roles.includes("Admin");
    const hasTeamAccess = user?.teams.some(team => team.id === teamId);

    if (!user || (!isAdmin && !hasTeamAccess)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get form configuration for the team
    const formSections = await prisma.formSection.findMany({
      where: { teamId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // Convert options from JSON to proper format
    const sectionsWithParsedOptions = formSections.map(section => ({
      ...section,
      fields: section.fields.map(field => ({
        ...field,
        options: field.options ? JSON.parse(field.options as string) : undefined,
      })),
    }));

    return NextResponse.json({ sections: sectionsWithParsedOptions });
  } catch (error) {
    console.error("Error fetching form configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch form configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    const { teamId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this team or is an admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { teams: true },
    });

    const isAdmin = user?.roles.includes("Admin");
    const hasTeamAccess = user?.teams.some(team => team.id === teamId);

    if (!user || (!isAdmin && !hasTeamAccess)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = formConfigSchema.parse(body);

    // Use transaction to update form configuration
    await prisma.$transaction(async (tx) => {
      // Delete existing configuration for this team
      await tx.formSection.deleteMany({
        where: { teamId },
      });

      // Create new configuration
      for (const sectionData of validatedData.sections) {
        const section = await tx.formSection.create({
          data: {
            name: sectionData.name,
            description: sectionData.description,
            order: sectionData.order,
            teamId,
          },
        });

        for (const fieldData of sectionData.fields) {
          await tx.formField.create({
            data: {
              key: fieldData.key,
              label: fieldData.label,
              description: fieldData.description,
              type: fieldData.type,
              placeholder: fieldData.placeholder,
              defaultValue: fieldData.defaultValue,
              isRequired: fieldData.isRequired,
              order: fieldData.order,
              minLength: fieldData.minLength,
              maxLength: fieldData.maxLength,
              minValue: fieldData.minValue,
              maxValue: fieldData.maxValue,
              pattern: fieldData.pattern,
              options: fieldData.options ? JSON.stringify(fieldData.options) : undefined,
              sectionId: section.id
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating form configuration:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form configuration data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update form configuration" },
      { status: 500 }
    );
  }
}