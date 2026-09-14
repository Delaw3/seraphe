import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { MailService } from "./mail.service";

@ApiTags("mail")
@Controller("api/mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("test")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Sends a fixed Gmail SMTP test email." })
  async sendTestEmail(): Promise<{ message: string; messageId?: string }> {
    const result = await this.mailService.sendTestEmail();

    return {
      message: "Test email sent successfully.",
      messageId: result.messageId,
    };
  }
}
