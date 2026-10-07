import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { RedisOptions } from "ioredis";

export interface RedisHealthResult {
  status: "ok";
  set: boolean;
  get: boolean;
  delete: boolean;
}

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private readonly client?: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.getTrimmedConfigValue("REDIS_URL");
    const host = this.getTrimmedConfigValue("REDIS_HOST");
    const portValue = this.getTrimmedConfigValue("REDIS_PORT");
    const port = Number(portValue);
    const options: RedisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 100, 2000),
    };

    if (redisUrl) {
      this.client = new Redis(redisUrl, options);
      this.registerClientEvents("Redis URL");
      return;
    }

    if (!host || !portValue || Number.isNaN(port)) {
      this.logger.warn("Redis configuration is missing or invalid.");
      return;
    }

    this.client = new Redis({
      host,
      port,
      ...options,
    });

    this.registerClientEvents(`${host}:${port}`);
  }

  private registerClientEvents(target: string): void {
    if (!this.client) {
      return;
    }

    this.client.on("error", (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });

    this.client.on("connect", () => {
      this.logger.log(`Redis connection established for ${target}.`);
    });

    this.client.on("close", () => {
      this.logger.warn("Redis connection closed.");
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.ensureConnected();
    } catch (error) {
      this.logger.warn(
        `Redis is unavailable during startup: ${this.getErrorMessage(error)}`,
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.client || this.client.status === "end") {
      return;
    }

    try {
      await this.client.quit();
    } catch (error) {
      this.logger.warn(
        `Redis quit failed, disconnecting: ${this.getErrorMessage(error)}`,
      );
      this.client.disconnect();
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new ServiceUnavailableException("Redis is not configured.");
    }

    return this.client;
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<"OK" | null> {
    const client = await this.getReadyClient();

    if (ttlSeconds) {
      return client.set(key, value, "EX", ttlSeconds);
    }

    return client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    const client = await this.getReadyClient();

    return client.get(key);
  }

  async del(key: string): Promise<number> {
    const client = await this.getReadyClient();

    return client.del(key);
  }

  async runHealthCheck(): Promise<RedisHealthResult> {
    const key = `seraphe:health:${Date.now()}`;
    const value = "ok";

    await this.set(key, value, 30);
    const storedValue = await this.get(key);
    const deletedCount = await this.del(key);

    if (storedValue !== value || deletedCount !== 1) {
      throw new ServiceUnavailableException("Redis health check failed.");
    }

    return {
      status: "ok",
      set: true,
      get: true,
      delete: true,
    };
  }

  private async getReadyClient(): Promise<Redis> {
    await this.ensureConnected();

    return this.getClient();
  }

  private async ensureConnected(): Promise<void> {
    const client = this.getClient();

    if (client.status === "ready") {
      return;
    }

    if (client.status === "connect" || client.status === "connecting") {
      await client.ping();
      return;
    }

    try {
      await client.connect();
    } catch (error) {
      throw new ServiceUnavailableException(
        `Redis is unavailable: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private getTrimmedConfigValue(key: string): string | undefined {
    return this.configService.get<string>(key)?.trim();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }
}
