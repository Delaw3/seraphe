import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { MailService } from "./mail.service";

@ApiTags("mail")
@Controller("api/mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("test")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Sends a Brevo test email." })
  async sendTestEmail(
    @Body() dto: SendTestEmailDto,
  ): Promise<{ message: string; messageId?: string }> {
    const result = await this.mailService.sendTestEmail(dto.email);

    return {
      message: "Test email sent successfully.",
      messageId: result.messageId,
    };
  }
}
