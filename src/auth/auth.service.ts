import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const email = signUpDto.email.toLowerCase().trim();
    const existingAdmin = await this.adminModel.exists({ email });

    if (existingAdmin) {
      throw new ConflictException('An admin with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(signUpDto.password, 12);
    const admin = await this.adminModel.create({
      name: signUpDto.name.trim(),
      email,
      passwordHash,
    });

    return this.createAuthResponse(admin);
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const email = signInDto.email.toLowerCase().trim();
    const admin = await this.adminModel.findOne({ email }).exec();

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      signInDto.password,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createAuthResponse(admin);
  }

  private createAuthResponse(admin: AdminDocument): AuthResponseDto {
    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: 'admin',
    });

    return {
      accessToken: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  }
}
