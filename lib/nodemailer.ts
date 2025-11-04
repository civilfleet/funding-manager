import fs from "node:fs";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import path from "node:path";
import type { EMAIL_CONTENT } from "@/types";
import config, { mailProvider } from "../config/mail";

const transporter = nodemailer.createTransport({
  ...config,
});

// Log the email provider being used
console.info(`[mail] Email provider configured: ${mailProvider}`);

const compileTemplate = (
  templateName: string,
  data: Record<string, unknown>,
) => {
  const filePath = path.join(
    process.cwd(),
    "templates",
    `${templateName}.handlebars`,
  );
  const source = fs.readFileSync(filePath, "utf-8");
  return handlebars.compile(source)(data);
};

async function sendEmail(
  emailContent: EMAIL_CONTENT,
  data: Record<string, unknown>,
) {
  try {
    const html = emailContent.content
      ? handlebars.compile(emailContent.content)(data)
      : compileTemplate(emailContent.template, {
          ...data,
        });

    const { to, subject, template } = {
      to: emailContent.to,
      subject: emailContent.subject,
      template: emailContent.template ?? "inline-content",
    };

    console.info("[mail] Dispatching email", {
      to,
      subject,
      template,
      hasContent: Boolean(emailContent.content),
    });

    // Determine sender email
    const senderEmail =
      emailContent?.from ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: senderEmail,
      to: emailContent.to,
      subject: emailContent.subject,
      html,
    });

    console.info("[mail] Email dispatched", {
      to,
      subject,
      messageId: info.messageId,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error("[mail] Error sending email", {
      to: emailContent.to,
      subject: emailContent.subject,
      template: emailContent.template ?? "inline-content",
      error,
    });
    throw error;
  }
}
export { sendEmail, transporter };
