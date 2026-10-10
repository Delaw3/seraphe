import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AdminRole } from "../schemas/admin.schema";
import { AdminTokenPayload } from "./admin-jwt.guard";

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const existingAdmin = request["admin"] as AdminTokenPayload | undefined;

    if (existingAdmin) {
      if (existingAdmin.role !== AdminRole.SUPER_ADMIN) {
        throw new ForbiddenException("Super admin access required.");
      }

      return true;
    }

    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AdminTokenPayload>(token);

      if (payload.role !== AdminRole.SUPER_ADMIN) {
        throw new ForbiddenException("Super admin access required.");
      }

      request["admin"] = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired token.");
    }
  }
}
