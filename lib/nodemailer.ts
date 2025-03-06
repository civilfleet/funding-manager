import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import config from "../config/mail";
import { EMAIL_CONTENT } from "@/types";

console.log("config", config);
const transporter = nodemailer.createTransport({
  ...config,
});

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const compileTemplate = (templateName: string, data: any) => {
  const filePath = path.join(
    process.cwd(),
    "templates",
    `${templateName}.handlebars`
  );
  console.log("filePath", filePath);
  const source = fs.readFileSync(filePath, "utf-8");
  return handlebars.compile(source)(data);
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
async function sendEmail(emailContent: EMAIL_CONTENT, data: any) {
  try {
    const html = compileTemplate(emailContent.template, {
      ...data,
    });

    const info = await transporter.sendMail({
      from: emailContent?.from ?? process.env.BREVO_SENDER_EMAIL,
      to: emailContent.to,
      subject: emailContent.subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
export { sendEmail, transporter };
