import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AdminJwtGuard } from "./guards/admin-jwt.guard";
import { SuperAdminGuard } from "./guards/super-admin.guard";
import { Admin, AdminSchema } from "./schemas/admin.schema";
import { MailModule } from "../mail/mail.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MailModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "1d") as "1d",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtGuard, SuperAdminGuard],
  exports: [AdminJwtGuard, SuperAdminGuard, JwtModule],
})
export class AuthModule {}
