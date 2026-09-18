import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { renderTestEmailTemplate } from "./templates/test-email.template";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(
    options: SendEmailOptions,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const transporter = this.getTransporter();
    const fromAddress = this.configService.get<string>("MAIL_FROM");

    if (!fromAddress) {
      this.logger.error("Email configuration is incomplete.");
      throw new ServiceUnavailableException("Email service is not configured.");
    }

    try {
      const result = await transporter.sendMail({
        from: `Seraphe Beauty <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `Email sent to ${options.to} with message id ${result.messageId}.`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException("Failed to send email.");
    }
  }

  async sendTestEmail(): Promise<SMTPTransport.SentMessageInfo> {
    return this.sendEmail({
      to: "lauphix1@gmail.com",
      subject: "Seraphe Beauty Email Test",
      text: "Seraphe Beauty\n\nGmail SMTP has been configured successfully.",
      html: renderTestEmailTemplate(),
    });
  }

  private getTransporter(): Transporter<SMTPTransport.SentMessageInfo> {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpConfig = this.getSmtpConfig();
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      requireTLS: !smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    this.logger.log(
      `SMTP transport configured for ${smtpConfig.host}:${smtpConfig.port} with secure=${smtpConfig.secure}.`,
    );

    return this.transporter;
  }

  private getSmtpConfig() {
    const host = this.getTrimmedConfigValue("SMTP_HOST");
    const portValue = this.getTrimmedConfigValue("SMTP_PORT");
    const port = Number(portValue);
    const secureValue = this.getTrimmedConfigValue("SMTP_SECURE");
    const secure = this.parseSecureValue(secureValue, port);
    const user = this.getTrimmedConfigValue("SMTP_USER");
    const password = this.getTrimmedConfigValue("SMTP_PASSWORD");

    if (
      !host ||
      !portValue ||
      Number.isNaN(port) ||
      secure === undefined ||
      !user ||
      !password
    ) {
      this.logger.error(
        `Email configuration is incomplete or invalid. SMTP_HOST=${this.describeConfigValue(host)}, SMTP_PORT=${this.describeConfigValue(portValue)}, SMTP_SECURE=${this.describeConfigValue(secureValue)}, SMTP_USER=${this.describeConfigValue(user)}, SMTP_PASSWORD=${this.describeConfigValue(password)}.`,
      );
      throw new ServiceUnavailableException("Email service is not configured.");
    }

    return {
      host,
      port,
      secure,
      user,
      password,
    };
  }

  private getTrimmedConfigValue(key: string): string | undefined {
    return this.configService.get<string>(key)?.trim();
  }

  private parseSecureValue(
    value: string | undefined,
    port: number,
  ): boolean | undefined {
    if (!value) {
      return Number.isNaN(port) ? undefined : port === 465;
    }

    const normalizedValue = value.toLowerCase();
    if (normalizedValue === "true") return true;
    if (normalizedValue === "false") return false;

    return undefined;
  }

  private describeConfigValue(value: string | undefined): "set" | "missing" {
    return value ? "set" : "missing";
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }
}
