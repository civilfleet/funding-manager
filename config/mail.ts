export default {
  host: process.env.BREVO_HOST as string, // SMTP host
  port: parseInt(process.env.BREVO_PORT as string), // SMTP port
  secure: true, // true for 465, false for other ports

  auth: {
    user: process.env.BREVO_USERNAME as string, // SMTP username
    pass: process.env.BREVO_PASSWORD as string, // SMTP password
  },
};
