import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { MailService } from "../mail/mail.service";
import { RedisService } from "../redis/redis.service";
import { AdminRole } from "./schemas/admin.schema";

describe("AuthService signup codes and roles", () => {
  const adminModelToken = getModelToken("Admin");
  let adminModel: Record<string, jest.Mock>;
  let jwtService: { sign: jest.Mock };
  let redisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let service: AuthService;

  beforeEach(async () => {
    adminModel = {
      exists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue("signed-token") };
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: adminModelToken, useValue: adminModel },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: {} },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("creates a signup code and returns it for manual sharing", async () => {
    adminModel.exists.mockResolvedValue(null);

    const result = await service.createSignupCode({
      email: "NewAdmin@SerapheBeauty.org ",
    });

    expect(adminModel.exists).toHaveBeenCalledWith({
      email: "newadmin@seraphebeauty.org",
    });
    expect(redisService.set).toHaveBeenCalledTimes(1);
    expect(redisService.set.mock.calls[0][0]).toBe(
      "seraphe:auth:signup-code:newadmin@seraphebeauty.org",
    );
    expect(redisService.set.mock.calls[0][2]).toBe(30 * 60);
    expect(result.email).toBe("newadmin@seraphebeauty.org");
    expect(result.code).toMatch(/^\d{6}$/);
  });

  it("rejects signup code creation for an existing admin", async () => {
    adminModel.exists.mockResolvedValue({ _id: "existing" });

    await expect(
      service.createSignupCode({ email: "taken@seraphebeauty.org" }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it("signs up with a valid code and consumes it", async () => {
    const codeHash = await bcrypt.hash("482913", 4);
    adminModel.exists.mockResolvedValue(null);
    redisService.get.mockResolvedValue(codeHash);
    adminModel.create.mockImplementation((doc: unknown) => ({
      id: "admin-id",
      ...(doc as Record<string, unknown>),
    }));

    const result = await service.signUp({
      name: "New Admin",
      email: "NewAdmin@SerapheBeauty.org",
      password: "StrongPassword123",
      code: "482913",
    });

    expect(redisService.del).toHaveBeenCalledWith(
      "seraphe:auth:signup-code:newadmin@seraphebeauty.org",
    );
    expect(adminModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newadmin@seraphebeauty.org",
        role: AdminRole.ADMIN,
      }),
    );
    expect(result.accessToken).toBe("signed-token");
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ role: AdminRole.ADMIN }),
    );
  });

  it("rejects signup without an issued code", async () => {
    adminModel.exists.mockResolvedValue(null);
    redisService.get.mockResolvedValue(null);

    await expect(
      service.signUp({
        name: "New Admin",
        email: "new@seraphebeauty.org",
        password: "StrongPassword123",
        code: "482913",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(adminModel.create).not.toHaveBeenCalled();
  });

  it("rejects signup with the wrong code", async () => {
    const codeHash = await bcrypt.hash("482913", 4);
    adminModel.exists.mockResolvedValue(null);
    redisService.get.mockResolvedValue(codeHash);

    await expect(
      service.signUp({
        name: "New Admin",
        email: "new@seraphebeauty.org",
        password: "StrongPassword123",
        code: "000000",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(adminModel.create).not.toHaveBeenCalled();
    expect(redisService.del).not.toHaveBeenCalled();
  });

  it("updates an admin role", async () => {
    const save = jest.fn();
    adminModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        id: "admin-id",
        name: "Jane",
        email: "jane@seraphebeauty.org",
        role: AdminRole.ADMIN,
        save,
      }),
    });

    const result = await service.updateAdminRole(
      "admin-id",
      { role: AdminRole.SUPER_ADMIN },
      "super-admin-id",
    );

    expect(save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({ role: AdminRole.SUPER_ADMIN }),
    );
  });

  it("rejects self-demotion", async () => {
    await expect(
      service.updateAdminRole(
        "same-id",
        { role: AdminRole.ADMIN },
        "same-id",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(adminModel.findById).not.toHaveBeenCalled();
  });

  it("rejects role updates for unknown admins", async () => {
    adminModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.updateAdminRole(
        "missing-id",
        { role: AdminRole.ADMIN },
        "super-admin-id",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

