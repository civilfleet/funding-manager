import brevo from "@getbrevo/brevo";

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor(apiKey: string) {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey
    );
  }

  /**
   * Send an email using Brevo
   * @param toEmail - Recipient's email address
   * @param templateId - ID of the template to use
   * @param templateParams - Parameters to replace in the template
   * @param subject - Email subject
   * @param senderEmail - Sender's email address
   * @param senderName - Sender's name
   * @returns Promise resolving to the email sending response
   */
  async sendEmail(
    toEmail: string,
    templateId: number,
    templateParams: Record<string, string>,
    subject: string,
    senderEmail: string,
    senderName: string
  ): Promise<brevo.CreateSmtpEmail> {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = templateParams;
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = { email: senderEmail, name: senderName };

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return response.body;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default EmailService;
