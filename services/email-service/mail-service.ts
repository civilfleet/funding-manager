import EmailService from "./brevo";

const emailService = new EmailService(process.env.BREVO_API_KEY as string);

async function sendWelcomeEmail(userEmail: string, userName: string) {
  const templateId = 1;
  const templateParams = {
    name: userName,
    company: "Your Company Name",
  };
  const subject = "Welcome to Our Platform!";
  const senderEmail = "support@civilfleet.org";
  const senderName = "Your Company Name";

  try {
    const response = await emailService.sendEmail(
      userEmail,
      templateId,
      templateParams,
      subject,
      senderEmail,
      senderName
    );
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
export { sendWelcomeEmail };
