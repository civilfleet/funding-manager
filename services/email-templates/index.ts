import prisma from "@/lib/prisma";
import { EmailTemplate } from "@/types";

const getEmailTemplateByType = async (teamId: string, type: string) => {
  const template = await prisma.emailTemplates.findFirst({
    where: {
      teamId,
      type,
    },
  });
  return template;
};
const getEmailTemplates = async (teamId: string) => {
  const templates = await prisma.emailTemplates.findMany({
    where: {
      teamId,
    },
  });
  return templates;
};
const createEmailTemplate = async (teamId: string, template: EmailTemplate) => {
  const newTemplate = await prisma.emailTemplates.create({
    data: {
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      isActive: template.isActive,
      teamId,
    },
  });
  return newTemplate;
};
const updateEmailTemplate = async (teamId: string, template: EmailTemplate) => {
  console.log(template);
  const updatedTemplate = await prisma.emailTemplates.update({
    where: { id: template.id },
    data: {
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      isActive: template.isActive,
    },
  });
  return updatedTemplate;
};

export { createEmailTemplate, getEmailTemplateByType, getEmailTemplates, updateEmailTemplate };
