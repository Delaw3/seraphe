import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RedisHealthResult, RedisService } from "../redis/redis.service";

@ApiTags("health")
@Controller("api/health")
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get("redis")
  @ApiOkResponse({
    description: "Checks Redis connectivity with SET, GET, and DEL.",
    schema: {
      example: {
        status: "ok",
        set: true,
        get: true,
        delete: true,
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: "Redis is not configured or unavailable.",
  })
  async checkRedis(): Promise<RedisHealthResult> {
    try {
      return await this.redisService.runHealthCheck();
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException("Redis health check failed.");
    }
  }
}
