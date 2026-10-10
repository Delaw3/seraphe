import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { Model } from "mongoose";
import { MailService } from "../mail/mail.service";
import { renderPasswordResetOtpTemplate } from "../mail/templates/password-reset-otp.template";
import { RedisService } from "../redis/redis.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { CreateSignupCodeDto } from "./dto/super-admin.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { UpdateAdminRoleDto } from "./dto/update-admin-role.dto";
import { Admin, AdminDocument, AdminRole } from "./schemas/admin.schema";

const PASSWORD_RESET_OTP_TTL_SECONDS = 10 * 60;
const SIGNUP_CODE_TTL_SECONDS = 30 * 60;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const email = signUpDto.email.toLowerCase().trim();
    const existingAdmin = await this.adminModel.exists({ email });

    if (existingAdmin) {
      throw new ConflictException("An admin with this email already exists.");
    }

    const codeHash = await this.redisService.get(
      this.getSignupCodeKey(email),
    );

    if (!codeHash) {
      throw new BadRequestException("Invalid or expired signup code.");
    }

    const codeMatches = await bcrypt.compare(signUpDto.code.trim(), codeHash);

    if (!codeMatches) {
      throw new BadRequestException("Invalid or expired signup code.");
    }

    // Single-use: consume the code before creating the account.
    await this.redisService.del(this.getSignupCodeKey(email));

    const passwordHash = await bcrypt.hash(signUpDto.password, 12);
    const admin = await this.adminModel.create({
      name: signUpDto.name.trim(),
      email,
      passwordHash,
      role: AdminRole.ADMIN,
    });

    return this.createAuthResponse(admin);
  }

  async createSignupCode(
    dto: CreateSignupCodeDto,
  ): Promise<{ message: string; email: string; code: string }> {
    const email = dto.email.toLowerCase().trim();
    const existingAdmin = await this.adminModel.exists({ email });

    if (existingAdmin) {
      throw new ConflictException("An admin with this email already exists.");
    }

    const code = randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 12);

    await this.redisService.set(
      this.getSignupCodeKey(email),
      codeHash,
      SIGNUP_CODE_TTL_SECONDS,
    );

    return {
      message:
        "Signup code created. Share it with the new admin; it expires in 30 minutes.",
      email,
      code,
    };
  }

  async updateAdminRole(
    adminId: string,
    dto: UpdateAdminRoleDto,
    currentAdminId: string,
  ): Promise<AuthResponseDto["admin"]> {
    if (adminId === currentAdminId && dto.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException("You cannot demote your own account.");
    }

    const admin = await this.adminModel.findById(adminId).exec();

    if (!admin) {
      throw new NotFoundException("Admin not found.");
    }

    admin.role = dto.role;
    await admin.save();

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const email = signInDto.email.toLowerCase().trim();
    const admin = await this.adminModel.findOne({ email }).exec();

    if (!admin) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(
      signInDto.password,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.createAuthResponse(admin);
  }

  async requestPasswordReset(
    dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const admin = await this.adminModel.findOne({ email }).exec();
    const doesNotExist = {
      message: "Email does not exist",
    };

    const emailExist = {
      message: "OTP sent successfully",
    };

    if (!admin) {
      return doesNotExist;
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 12);

    await this.redisService.set(
      this.getPasswordResetOtpKey(email),
      otpHash,
      PASSWORD_RESET_OTP_TTL_SECONDS,
    );

    await this.mailService.sendEmail({
      to: admin.email,
      subject: "Seraphe Beauty Password Reset OTP",
      text: `Your Seraphe Beauty admin password reset OTP is ${otp}. It expires in 10 minutes.`,
      html: renderPasswordResetOtpTemplate({ otp }),
    });

    return emailExist;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const admin = await this.adminModel.findOne({ email }).exec();
    const otpHash = await this.redisService.get(
      this.getPasswordResetOtpKey(email),
    );

    if (!admin || !otpHash) {
      throw new BadRequestException("Invalid or expired OTP.");
    }

    const otpMatches = await bcrypt.compare(dto.otp, otpHash);

    if (!otpMatches) {
      throw new BadRequestException("Invalid or expired OTP.");
    }

    if (dto.oldPassword) {
      const oldPasswordMatches = await bcrypt.compare(
        dto.oldPassword,
        admin.passwordHash,
      );

      if (!oldPasswordMatches) {
        throw new UnauthorizedException("Invalid old password.");
      }
    }

    admin.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await admin.save();
    await this.redisService.del(this.getPasswordResetOtpKey(email));

    return { message: "Password reset successfully." };
  }

  private createAuthResponse(admin: AdminDocument): AuthResponseDto {
    const role = admin.role ?? AdminRole.ADMIN;
    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role,
    });

    return {
      accessToken: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role,
      },
    };
  }

  private getPasswordResetOtpKey(email: string): string {
    return `seraphe:auth:password-reset-otp:${email}`;
  }

  private getSignupCodeKey(email: string): string {
    return `seraphe:auth:signup-code:${email}`;
  }
}
