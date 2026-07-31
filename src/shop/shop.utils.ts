import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiResponse,
  PaginationMeta,
} from './interfaces/api-response.interface';

export function createApiResponse<T>(
  message: string,
  data: T,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data: omitVersionFields(data),
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

function omitFields<T>(value: T, hiddenKeys: string[]): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitFields(item, hiddenKeys)) as T;
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
      if (!hiddenKeys.includes(key)) {
        clean[key] = omitFields(fieldValue, hiddenKeys);
      }

      return clean;
    },
    {} as Record<string, unknown>,
  ) as T;
}

export function omitVersionFields<T>(value: T): T {
  return omitFields(value, ['__v', '_v']);
}

export function omitInternalFields<T>(value: T): T {
  return omitFields(value, ['isActive', '__v', '_v']);
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
