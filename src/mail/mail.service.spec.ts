import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";

function createConfigService(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

describe("MailService (Brevo HTTPS API)", () => {
  const baseEnv = {
    BREVO_API_KEY: "test-brevo-key",
    MAIL_FROM: "noreply@seraphebeauty.org",
    MAIL_FROM_NAME: "Seraphe Beauty",
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends an email through the Brevo API with sender, recipient, subject, and content", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(201, { messageId: "brevo-message-1" }),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: createConfigService({ ...baseEnv }) },
      ],
    }).compile();

    const service = module.get(MailService);
    const result = await service.sendEmail({
      to: "JANE@Example.com ",
      subject: "Hello",
      text: "plain text",
      html: "<p>html</p>",
    });

    expect(result).toEqual({ messageId: "brevo-message-1" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as unknown as [
      string,
      { method: string; headers: Record<string, string>; body: string },
    ];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect(init.headers["api-key"]).toBe("test-brevo-key");
    expect(JSON.parse(init.body)).toEqual({
      sender: { name: "Seraphe Beauty", email: "noreply@seraphebeauty.org" },
      to: [{ email: "jane@example.com" }],
      subject: "Hello",
      htmlContent: "<p>html</p>",
      textContent: "plain text",
    });
  });

  it("supports EMAIL_FROM / EMAIL_FROM_NAME aliases", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(201, { messageId: "brevo-message-2" }),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: createConfigService({
            BREVO_API_KEY: "test-brevo-key",
            EMAIL_FROM: "alias@seraphebeauty.org",
            EMAIL_FROM_NAME: "Alias Name",
          }),
        },
      ],
    }).compile();

    const service = module.get(MailService);
    await service.sendEmail({ to: "user@example.com", subject: "Hi" });

    const [, init] = fetchSpy.mock.calls[0] as unknown as [
      string,
      { body: string },
    ];
    expect(JSON.parse(init.body).sender).toEqual({
      name: "Alias Name",
      email: "alias@seraphebeauty.org",
    });
  });

  it("throws ServiceUnavailableException when the Brevo API key is missing", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: createConfigService({ MAIL_FROM: "noreply@seraphebeauty.org" }),
        },
      ],
    }).compile();

    const service = module.get(MailService);
    await expect(
      service.sendEmail({ to: "user@example.com", subject: "Hi" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws ServiceUnavailableException when the sender address is missing", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: createConfigService({ BREVO_API_KEY: "test-brevo-key" }),
        },
      ],
    }).compile();

    const service = module.get(MailService);
    await expect(
      service.sendEmail({ to: "user@example.com", subject: "Hi" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws InternalServerErrorException when Brevo rejects the request", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(401, { message: "Unauthorized" }),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: createConfigService({ ...baseEnv }) },
      ],
    }).compile();

    const service = module.get(MailService);
    await expect(
      service.sendEmail({ to: "user@example.com", subject: "Hi" }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it("throws InternalServerErrorException when the network request fails", async () => {
    jest.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network down"));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: createConfigService({ ...baseEnv }) },
      ],
    }).compile();

    const service = module.get(MailService);
    await expect(
      service.sendEmail({ to: "user@example.com", subject: "Hi" }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it("keeps the test-email workflow intact", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(201, { messageId: "brevo-test-1" }),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: createConfigService({ ...baseEnv }) },
      ],
    }).compile();

    const service = module.get(MailService);
    const result = await service.sendTestEmail("Tester@Example.com");
    expect(result).toEqual({ messageId: "brevo-test-1" });
  });
});
