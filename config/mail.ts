// Check if Brevo is configured, otherwise fall back to SMTP
const isBrevoConfigured =
  process.env.BREVO_HOST &&
  process.env.BREVO_USERNAME &&
  process.env.BREVO_PASSWORD;

const isSMTPConfigured =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const mailConfig = isBrevoConfigured
  ? {
      host: process.env.BREVO_HOST as string, // SMTP host
      port: Number(process.env.BREVO_PORT) || 465, // SMTP port
      secure: process.env.BREVO_SECURE !== "false", // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_USERNAME as string, // SMTP username
        pass: process.env.BREVO_PASSWORD as string, // SMTP password
      },
    }
  : isSMTPConfigured
    ? {
        host: process.env.SMTP_HOST as string,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER as string,
          pass: process.env.SMTP_PASS as string,
        },
      }
    : {
        // Fallback configuration (will fail if no provider is configured)
        host: "localhost",
        port: 25,
        secure: false,
      };

// Export mail provider info for logging
export const mailProvider = isBrevoConfigured
  ? "Brevo"
  : isSMTPConfigured
    ? "SMTP"
    : "None";

export default mailConfig;
