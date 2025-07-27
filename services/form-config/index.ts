import prisma from "@/lib/prisma";
import { FormSection, FormField, FieldType } from "@/types";

export async function getFormConfiguration(teamId: string): Promise<FormSection[]> {
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
  return formSections.map(section => ({
    ...section,
    fields: section.fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options as string) : undefined,
      minValue: field.minValue ? Number(field.minValue) : undefined,
      maxValue: field.maxValue ? Number(field.maxValue) : undefined,
    })),
  })) as FormSection[];
}

export async function getDefaultFormConfiguration(): Promise<FormSection[]> {
  return [
    {
      id: "default-1",
      name: "Basic Information",
      description: "Essential project details",
      order: 1,
      teamId: undefined,
      fields: [
        {
          id: "default-field-1",
          key: "name",
          label: "Project Name",
          description: "Provide a clear, concise name for your funding request",
          type: FieldType.TEXT,
          placeholder: "Enter the name of your project",
          isRequired: true,
          order: 1,
          minLength: 3,
          sectionId: "default-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "default-field-2",
          key: "amountRequested",
          label: "Amount Requested",
          type: FieldType.NUMBER,
          placeholder: "0.00",
          isRequired: true,
          order: 2,
          minValue: 0,
          sectionId: "default-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "default-field-3",
          key: "expectedCompletionDate",
          label: "Expected Completion Date",
          type: FieldType.DATE,
          isRequired: true,
          order: 3,
          sectionId: "default-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "default-2",
      name: "Project Details",
      description: "Detailed information about your project",
      order: 2,
      teamId: undefined,
      fields: [
        {
          id: "default-field-4",
          key: "description",
          label: "Project Description",
          description: "Explain what your project is about and why it matters",
          type: FieldType.TEXTAREA,
          placeholder: "Provide a detailed description of your project",
          isRequired: true,
          order: 1,
          minLength: 10,
          sectionId: "default-2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "default-field-5",
          key: "purpose",
          label: "Project Purpose",
          description: "Clearly state the objectives and intended outcomes",
          type: FieldType.TEXTAREA,
          placeholder: "Describe the purpose and goals of your project",
          isRequired: true,
          order: 2,
          minLength: 10,
          sectionId: "default-2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "default-3",
      name: "Financial Planning",
      description: "Financial sustainability and planning details",
      order: 3,
      teamId: undefined,
      fields: [
        {
          id: "default-field-6",
          key: "refinancingConcept",
          label: "Refinancing Concept",
          description: "Detail how the project will be financially sustainable after initial funding",
          type: FieldType.TEXTAREA,
          placeholder: "Explain your refinancing strategy",
          isRequired: true,
          order: 1,
          minLength: 10,
          sectionId: "default-3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "default-field-7",
          key: "sustainability",
          label: "Sustainability Plan",
          description: "Outline the long-term viability and impact of your project",
          type: FieldType.TEXTAREA,
          placeholder: "Describe how your project will be sustainable in the long term",
          isRequired: true,
          order: 2,
          minLength: 10,
          sectionId: "default-3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export async function createDefaultFormConfiguration(teamId: string): Promise<void> {
  const defaultConfig = await getDefaultFormConfiguration();
  
  await prisma.$transaction(async (tx) => {
    for (const sectionData of defaultConfig) {
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
            sectionId: section.id,
          },
        });
      }
    }
  });
}