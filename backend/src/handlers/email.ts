import nodemailer from 'nodemailer';
import { Config } from '../config.js';

export class EmailHandler {
  private config: Config;

  constructor() {
    this.config = Config.getInstance();
  }

  async sendEmail(recipient: string, subject: string, body: string) {
    try {
      const emailConfig = this.config.loadEmailConfig();
      
      if (!emailConfig) {
        return {
          content: [
            {
              type: 'text',
              text: 'Email configuration not found. Please set EMAIL_USER and EMAIL_PASS environment variables.',
            },
          ],
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) {
        return {
          content: [
            {
              type: 'text',
              text: 'Invalid email address format.',
            },
          ],
        };
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
      });

      // Verify connection
      await transporter.verify();

      // Send email
      const info = await transporter.sendMail({
        from: emailConfig.auth.user,
        to: recipient,
        subject: subject,
        text: body,
        html: this.textToHtml(body),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Email sent successfully to ${recipient}!\nMessage ID: ${info.messageId}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private textToHtml(text: string): string {
    // Convert plain text to basic HTML
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
}
