import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { renderTestEmailTemplate } from "./templates/test-email.template";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SentEmailResult {
  messageId: string;
}

interface BrevoSendEmailResponse {
  messageId?: string;
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const DEFAULT_FROM_NAME = "Seraphe Beauty";
const REQUEST_TIMEOUT_MS = 15_000;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(options: SendEmailOptions): Promise<SentEmailResult> {
    const apiKey = this.getTrimmedConfigValue("BREVO_API_KEY");
    const { address: fromAddress, name: fromName } = this.getFromConfig();
    const to = options.to.toLowerCase().trim();

    if (!apiKey) {
      this.logger.error(
        "Email configuration is incomplete or invalid. BREVO_API_KEY=missing.",
      );
      throw new ServiceUnavailableException("Email service is not configured.");
    }

    if (!to) {
      throw new InternalServerErrorException("Failed to send email.");
    }

    const payload: Record<string, unknown> = {
      sender: { name: fromName, email: fromAddress },
      to: [{ email: to }],
      subject: options.subject,
    };

    if (options.html) {
      payload.htmlContent = options.html;
    }

    if (options.text) {
      payload.textContent = options.text;
    }

    let response: Response;

    try {
      response = await this.postToBrevo(apiKey, payload);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException("Failed to send email.");
    }

    if (!response.ok) {
      const detail = await this.readErrorDetail(response);
      this.logger.error(
        `Brevo API rejected email to ${to} with status ${response.status}${detail ? `: ${detail}` : "."}`,
      );
      throw new InternalServerErrorException("Failed to send email.");
    }

    const messageId = await this.readMessageId(response, to);

    this.logger.log(`Email sent to ${to} with message id ${messageId}.`);

    return { messageId };
  }

  async sendTestEmail(to: string): Promise<SentEmailResult> {
    return this.sendEmail({
      to: to.toLowerCase().trim(),
      subject: "Seraphe Beauty Email Test",
      text: "Seraphe Beauty\n\nEmail service has been configured successfully.",
      html: renderTestEmailTemplate(),
    });
  }

  private async postToBrevo(
    apiKey: string,
    payload: Record<string, unknown>,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      return await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readMessageId(
    response: Response,
    to: string,
  ): Promise<string> {
    try {
      const body = (await response.json()) as BrevoSendEmailResponse;
      if (body?.messageId) {
        return body.messageId;
      }
    } catch (error) {
      this.logger.warn(
        `Brevo API response for ${to} did not include a message id: ${this.getErrorMessage(error)}`,
      );
    }

    return `brevo-${Date.now()}`;
  }

  private async readErrorDetail(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text.slice(0, 500);
    } catch {
      return "";
    }
  }

  private getFromConfig(): { address: string; name: string } {
    // MAIL_FROM is the canonical var; EMAIL_FROM stays supported as an alias.
    const address =
      this.getTrimmedConfigValue("MAIL_FROM") ??
      this.getTrimmedConfigValue("EMAIL_FROM");
    const name =
      this.getTrimmedConfigValue("MAIL_FROM_NAME") ??
      this.getTrimmedConfigValue("EMAIL_FROM_NAME") ??
      DEFAULT_FROM_NAME;

    if (!address) {
      this.logger.error(
        "Email configuration is incomplete or invalid. MAIL_FROM/EMAIL_FROM=missing.",
      );
      throw new ServiceUnavailableException("Email service is not configured.");
    }

    return { address, name };
  }

  private getTrimmedConfigValue(key: string): string | undefined {
    const value = this.configService.get<string>(key)?.trim();
    return value ? value : undefined;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }
}


