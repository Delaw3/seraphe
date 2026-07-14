import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiResponse, PaginationMeta } from './interfaces/api-response.interface';

export function createApiResponse<T>(
  message: string,
  data: T,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function omitInternalFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitInternalFields(item)) as T;
  }

  if (
    !value ||
    typeof value !== 'object' ||
    value instanceof Date ||
    value instanceof Types.ObjectId
  ) {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (clean, [key, fieldValue]) => {
      if (key !== 'isActive') {
        clean[key] = omitInternalFields(fieldValue);
      }

      return clean;
    },
    {} as Record<string, unknown>,
  ) as T;
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toBoolean(value?: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

export function toObjectId(value: string, message: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException(message);
  }

  return new Types.ObjectId(value);
}
