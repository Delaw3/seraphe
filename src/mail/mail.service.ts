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

export interface SentEmailResult extends SMTPTransport.SentMessageInfo {
  messageId: string;
}

const DEFAULT_BREVO_SMTP_HOST = "smtp-relay.brevo.com";
const DEFAULT_BREVO_SMTP_PORT = 587;
const DEFAULT_FROM_NAME = "Seraphe Beauty";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(options: SendEmailOptions): Promise<SentEmailResult> {
    const transporter = this.getTransporter();
    const { address: fromAddress, name: fromName } = this.getFromConfig();

    try {
      const result = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `Email sent to ${options.to} with message id ${result.messageId}.`,
      );
      return result as SentEmailResult;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException("Failed to send email.");
    }
  }

  async sendTestEmail(to: string): Promise<SentEmailResult> {
    return this.sendEmail({
      to: to.toLowerCase().trim(),
      subject: "Seraphe Beauty Email Test",
      text: "Seraphe Beauty\n\nEmail service has been configured successfully.",
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
      `Brevo SMTP transport configured for ${smtpConfig.host}:${smtpConfig.port} with secure=${smtpConfig.secure}.`,
    );

    return this.transporter;
  }

  private getSmtpConfig() {
    const host =
      this.getTrimmedConfigValue("SMTP_HOST") ?? DEFAULT_BREVO_SMTP_HOST;
    const portValue = this.getTrimmedConfigValue("SMTP_PORT");
    const port = portValue
      ? Number(portValue)
      : DEFAULT_BREVO_SMTP_PORT;
    const secureValue = this.getTrimmedConfigValue("SMTP_SECURE");
    const secure = this.parseSecureValue(secureValue, port);
    // Brevo relay credentials use SMTP_USER + SMTP_PASS (SMTP_PASSWORD kept as alias).
    const user = this.getTrimmedConfigValue("SMTP_USER");
    const password =
      this.getTrimmedConfigValue("SMTP_PASSWORD") ??
      this.getTrimmedConfigValue("SMTP_PASS");

    if (
      !host ||
      Number.isNaN(port) ||
      secure === undefined ||
      !user ||
      !password
    ) {
      this.logger.error(
        `Email configuration is incomplete or invalid. SMTP_HOST=${this.describeConfigValue(host)}, SMTP_PORT=${this.describeConfigValue(portValue ?? String(port))}, SMTP_SECURE=${this.describeConfigValue(secureValue)}, SMTP_USER=${this.describeConfigValue(user)}, SMTP_PASSWORD/SMTP_PASS=${password ? "set" : "missing"}.`,
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

  private getFromConfig(): { address: string; name: string } {
    // MAIL_FROM is the canonical var; EMAIL_FROM is accepted for Brevo setups.
    const address =
      this.getTrimmedConfigValue("MAIL_FROM") ??
      this.getTrimmedConfigValue("EMAIL_FROM");
    const name =
      this.getTrimmedConfigValue("MAIL_FROM_NAME") ??
      this.getTrimmedConfigValue("EMAIL_FROM_NAME") ??
      DEFAULT_FROM_NAME;

    if (!address) {
      this.logger.error("Email configuration is incomplete.");
      throw new ServiceUnavailableException("Email service is not configured.");
    }

    return { address, name };
  }

  private getTrimmedConfigValue(key: string): string | undefined {
    const value = this.configService.get<string>(key)?.trim();
    return value ? value : undefined;
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

