import fs from "fs";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import path from "path";
import { EMAIL_CONTENT } from "@/types";
import config from "../config/mail";

const transporter = nodemailer.createTransport({
  ...config,
});

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
    let html;
    if (!emailContent.content) {
      html = compileTemplate(emailContent.template, {
        ...data,
      });
    } else {
      html = handlebars.compile(emailContent.content)(data);
    }

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

    const info = await transporter.sendMail({
      from: emailContent?.from ?? process.env.BREVO_SENDER_EMAIL,
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
