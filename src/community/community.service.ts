import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { ApiResponse } from '../shop/interfaces/api-response.interface';
import {
  createApiResponse,
  createPaginationMeta,
  omitInternalFields,
  toObjectId,
} from '../shop/shop.utils';
import { CreateCommunitySubscriberDto } from './dto/create-community-subscriber.dto';
import { QueryCommunitySubscribersDto } from './dto/query-community-subscribers.dto';
import {
  CommunitySubscriber,
  CommunitySubscriberDocument,
} from './schemas/community-subscriber.schema';

type PlainCommunitySubscriber = CommunitySubscriber & { _id: Types.ObjectId };

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(CommunitySubscriber.name)
    private readonly subscriberModel: Model<CommunitySubscriberDocument>,
  ) {}

  async subscribe(
    dto: CreateCommunitySubscriberDto,
  ): Promise<ApiResponse<PlainCommunitySubscriber>> {
    const email = dto.email.toLowerCase().trim();
    const subscriber = await this.subscriberModel
      .findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            name: dto.name?.trim(),
            isActive: true,
            unsubscribedAt: null,
          },
          $setOnInsert: {
            subscribedAt: new Date(),
          },
        },
        { new: true, upsert: true },
      )
      .lean<PlainCommunitySubscriber>()
      .exec();

    return createApiResponse(
      'Community signup successful.',
      omitInternalFields(subscriber),
    );
  }

  async findAdminSubscribers(
    query: QueryCommunitySubscribersDto,
  ): Promise<ApiResponse<PlainCommunitySubscriber[]>> {
    const filter = this.buildSubscriberFilter(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      this.subscriberModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainCommunitySubscriber[]>()
        .exec(),
      this.subscriberModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      'Community subscribers retrieved successfully.',
      subscribers,
      createPaginationMeta(page, limit, total),
    );
  }

  async findAdminSubscriber(
    id: string,
  ): Promise<ApiResponse<PlainCommunitySubscriber>> {
    const subscriber = await this.subscriberModel
      .findById(toObjectId(id, 'Community subscriber id is invalid.'))
      .lean<PlainCommunitySubscriber>()
      .exec();

    if (!subscriber) {
      throw new NotFoundException('Community subscriber not found.');
    }

    return createApiResponse(
      'Community subscriber retrieved successfully.',
      subscriber,
    );
  }

  async unsubscribe(id: string): Promise<ApiResponse<PlainCommunitySubscriber>> {
    const subscriber = await this.subscriberModel
      .findByIdAndUpdate(
        toObjectId(id, 'Community subscriber id is invalid.'),
        { isActive: false, unsubscribedAt: new Date() },
        { new: true },
      )
      .lean<PlainCommunitySubscriber>()
      .exec();

    if (!subscriber) {
      throw new NotFoundException('Community subscriber not found.');
    }

    return createApiResponse(
      'Community subscriber removed successfully.',
      subscriber,
    );
  }

  private buildSubscriberFilter(
    query: QueryCommunitySubscribersDto,
  ): QueryFilter<CommunitySubscriberDocument> {
    const filter: QueryFilter<CommunitySubscriberDocument> = {};

    if (typeof query.active === 'boolean') {
      filter.isActive = query.active;
    }

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    return filter;
  }
}
