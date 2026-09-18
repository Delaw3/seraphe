import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QueryFilter, Types } from "mongoose";
import { MailService } from "../mail/mail.service";
import { renderNewsletterWelcomeTemplate } from "../mail/templates/newsletter-welcome.template";
import { ApiResponse } from "../shop/interfaces/api-response.interface";
import {
  createApiResponse,
  createPaginationMeta,
  omitInternalFields,
  toObjectId,
} from "../shop/shop.utils";
import { CreateCommunitySubscriberDto } from "./dto/create-community-subscriber.dto";
import { QueryCommunitySubscribersDto } from "./dto/query-community-subscribers.dto";
import {
  CommunitySubscriber,
  CommunitySubscriberDocument,
} from "./schemas/community-subscriber.schema";

type PlainCommunitySubscriber = CommunitySubscriber & { _id: Types.ObjectId };

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    @InjectModel(CommunitySubscriber.name)
    private readonly subscriberModel: Model<CommunitySubscriberDocument>,
    private readonly mailService: MailService,
  ) {}

  async subscribe(
    dto: CreateCommunitySubscriberDto,
  ): Promise<ApiResponse<PlainCommunitySubscriber>> {
    const email = dto.email.toLowerCase().trim();
    let subscriber: PlainCommunitySubscriber | null;

    try {
      subscriber = await this.subscriberModel
        .findOneAndUpdate(
          { email, isActive: false },
          {
            $set: {
              email,
              name: dto.name?.trim(),
              isActive: true,
              unsubscribedAt: null,
              subscribedAt: new Date(),
            },
          },
          { new: true, upsert: true },
        )
        .lean<PlainCommunitySubscriber>()
        .exec();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException("This email is already subscribed.");
      }

      throw error;
    }

    await this.sendNewsletterWelcomeEmail(email, dto.name);

    return createApiResponse(
      "Community signup successful.",
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
      "Community subscribers retrieved successfully.",
      subscribers,
      createPaginationMeta(page, limit, total),
    );
  }

  async findAdminSubscriber(
    id: string,
  ): Promise<ApiResponse<PlainCommunitySubscriber>> {
    const subscriber = await this.subscriberModel
      .findOne({
        _id: toObjectId(id, "Community subscriber id is invalid."),
        isActive: true,
      })
      .lean<PlainCommunitySubscriber>()
      .exec();

    if (!subscriber) {
      throw new NotFoundException("Community subscriber not found.");
    }

    return createApiResponse(
      "Community subscriber retrieved successfully.",
      subscriber,
    );
  }

  async unsubscribe(
    id: string,
  ): Promise<ApiResponse<PlainCommunitySubscriber>> {
    const subscriber = await this.subscriberModel
      .findOneAndUpdate(
        {
          _id: toObjectId(id, "Community subscriber id is invalid."),
          isActive: true,
        },
        { isActive: false, unsubscribedAt: new Date() },
        { new: true },
      )
      .lean<PlainCommunitySubscriber>()
      .exec();

    if (!subscriber) {
      throw new NotFoundException("Community subscriber not found.");
    }

    return createApiResponse(
      "Community subscriber removed successfully.",
      subscriber,
    );
  }

  private buildSubscriberFilter(
    query: QueryCommunitySubscribersDto,
  ): QueryFilter<CommunitySubscriberDocument> {
    const filter: QueryFilter<CommunitySubscriberDocument> = {
      isActive: true,
    };

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    return filter;
  }

  private async sendNewsletterWelcomeEmail(
    email: string,
    name?: string,
  ): Promise<void> {
    try {
      await this.mailService.sendEmail({
        to: email,
        subject: "Welcome to the Seraphe Beauty Newsletter",
        text:
          `Hi ${name?.trim() || "there"},\n\n` +
          "Thank you for joining the Seraphe Beauty community. You are now on the list for beauty tips, product updates, skincare notes, and special announcements.\n\n" +
          "Visit Seraphe Beauty: https://seraphebeauty.org",
        html: renderNewsletterWelcomeTemplate({ name }),
      });
    } catch (error) {
      this.logger.error(
        `Newsletter welcome email failed for ${email}: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    );
  }
}
