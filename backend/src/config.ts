import { z } from 'zod';

const EmailConfigSchema = z.object({
  host: z.string().default('smtp.gmail.com'),
  port: z.number().default(587),
  secure: z.boolean().default(false),
  auth: z.object({
    user: z.string(),
    pass: z.string(),
  }),
});

export type EmailConfig = z.infer<typeof EmailConfigSchema>;

export class Config {
  private static instance: Config;
  private emailConfig: EmailConfig | null = null;

  private constructor() {}

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  loadEmailConfig(): EmailConfig | null {
    if (this.emailConfig) {
      return this.emailConfig;
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('Email configuration not found. Set EMAIL_USER and EMAIL_PASS environment variables.');
      return null;
    }

    try {
      this.emailConfig = EmailConfigSchema.parse({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user,
          pass,
        },
      });
      return this.emailConfig;
    } catch (error) {
      console.error('Invalid email configuration:', error);
      return null;
    }
  }

  getCVFilePath(): string {
    return process.env.CV_FILE_PATH || './Navindya.pdf';
  }
}
