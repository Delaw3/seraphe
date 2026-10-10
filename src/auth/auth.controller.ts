import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { authResponseExample } from "../common/swagger-response.examples";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { CreateSignupCodeDto } from "./dto/super-admin.dto";
import { UpdateAdminRoleDto } from "./dto/update-admin-role.dto";
import { AdminTokenPayload, AdminJwtGuard } from "./guards/admin-jwt.guard";
import { SuperAdminGuard } from "./guards/super-admin.guard";

@ApiTags("auth")
@Controller("api/auth/admin")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiCreatedResponse({
    type: AuthResponseDto,
    schema: { example: authResponseExample },
  })
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
    return this.authService.signUp(signUpDto);
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthResponseDto,
    schema: { example: authResponseExample },
  })
  signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @Post("signup-codes")
  @UseGuards(AdminJwtGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    schema: {
      example: {
        message:
          "Signup code created. Share it with the new admin; it expires in 30 minutes.",
        email: "newadmin@seraphebeauty.org",
        code: "482913",
      },
    },
  })
  createSignupCode(
    @Body() dto: CreateSignupCodeDto,
  ): Promise<{ message: string; email: string; code: string }> {
    return this.authService.createSignupCode(dto);
  }

  @Patch(":adminId/role")
  @UseGuards(AdminJwtGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: "Admin role updated successfully.",
        data: {
          id: "6690f3f5e7f9c1a001234567",
          name: "Seraphe Admin",
          email: "admin@seraphebeauty.org",
          role: "ADMIN",
        },
      },
    },
  })
  async updateAdminRole(
    @Param("adminId") adminId: string,
    @Body() dto: UpdateAdminRoleDto,
    @Req() request: Request,
  ): Promise<{
    success: boolean;
    message: string;
    data: AuthResponseDto["admin"];
  }> {
    const currentAdmin = request["admin"] as AdminTokenPayload;
    const data = await this.authService.updateAdminRole(
      adminId,
      dto,
      currentAdmin.sub,
    );

    return {
      success: true,
      message: "Admin role updated successfully.",
      data,
    };
  }

  @Post("forgot-password/send-otp")
  @ApiOkResponse({
    schema: {
      example: {
        message: "If the email exists, a password reset OTP has been sent.",
      },
    },
  })
  requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(dto);
  }

  @Post("forgot-password/reset")
  @ApiOkResponse({
    schema: { example: { message: "Password reset successfully." } },
  })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }
}
