import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { ApiResponse } from '../shop/interfaces/api-response.interface';
import {
  createApiResponse,
  createPaginationMeta,
  omitInternalFields,
  slugify,
  toObjectId,
} from '../shop/shop.utils';
import { CreateTrendDto } from './dto/create-trend.dto';
import { QueryTrendsDto } from './dto/query-trends.dto';
import { UpdateTrendDto } from './dto/update-trend.dto';
import { Trend, TrendDocument } from './schemas/trend.schema';

type PlainTrend = Trend & { _id: Types.ObjectId };

@Injectable()
export class TrendsService {
  constructor(
    @InjectModel(Trend.name)
    private readonly trendModel: Model<TrendDocument>,
  ) {}

  async createTrend(dto: CreateTrendDto): Promise<ApiResponse<PlainTrend>> {
    const slug = await this.resolveUniqueSlug(dto.slug?.trim() || dto.title);
    const trend = await this.trendModel.create({
      ...dto,
      title: dto.title.trim(),
      slug,
      focusArea: dto.focusArea.trim(),
      focusAreaSlug: slugify(dto.focusArea),
      label: dto.label?.trim(),
      subtitle: dto.subtitle?.trim(),
      excerpt: dto.excerpt.trim(),
      content: dto.content.trim(),
      author: dto.author?.trim(),
      featureImage: dto.featureImage.trim(),
      images: dto.images ?? [],
      hashtags: dto.hashtags ?? [],
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      isFeatured: dto.isFeatured ?? false,
      isActive: true,
      order: dto.order ?? 0,
    });

    return createApiResponse('Trend created successfully.', trend.toObject());
  }

  async findAdminTrends(
    query: QueryTrendsDto,
  ): Promise<ApiResponse<PlainTrend[]>> {
    return this.paginateTrends(
      this.buildTrendFilter(query),
      query,
      'Trends retrieved successfully.',
    );
  }

  async findPublicTrends(
    query: QueryTrendsDto,
  ): Promise<ApiResponse<PlainTrend[]>> {
    const response = await this.paginateTrends(
      this.buildTrendFilter(query, true),
      query,
      'Trends retrieved successfully.',
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findAdminTrend(id: string): Promise<ApiResponse<PlainTrend>> {
    const trend = await this.trendModel
      .findById(toObjectId(id, 'Trend id is invalid.'))
      .lean<PlainTrend>()
      .exec();

    if (!trend) {
      throw new NotFoundException('Trend not found.');
    }

    return createApiResponse('Trend retrieved successfully.', trend);
  }

  async findPublicTrendBySlug(slug: string): Promise<ApiResponse<PlainTrend>> {
    const trend = await this.trendModel
      .findOne({ slug, isActive: true })
      .lean<PlainTrend>()
      .exec();

    if (!trend) {
      throw new NotFoundException('Trend not found.');
    }

    return createApiResponse(
      'Trend retrieved successfully.',
      omitInternalFields(trend),
    );
  }

  async updateTrend(
    id: string,
    dto: UpdateTrendDto,
  ): Promise<ApiResponse<PlainTrend>> {
    const trendId = toObjectId(id, 'Trend id is invalid.');
    const existing = await this.trendModel.findById(trendId).lean().exec();

    if (!existing) {
      throw new NotFoundException('Trend not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.title) update.title = dto.title.trim();
    delete update.slug;
    if (dto.slug?.trim()) {
      update.slug = await this.resolveProvidedSlug(dto.slug, id);
    }
    if (dto.focusArea) {
      update.focusArea = dto.focusArea.trim();
      update.focusAreaSlug = slugify(dto.focusArea);
    }
    if (dto.label) update.label = dto.label.trim();
    if (dto.subtitle) update.subtitle = dto.subtitle.trim();
    if (dto.excerpt) update.excerpt = dto.excerpt.trim();
    if (dto.content) update.content = dto.content.trim();
    if (dto.author) update.author = dto.author.trim();
    if (dto.featureImage) update.featureImage = dto.featureImage.trim();
    if (dto.publishedAt) update.publishedAt = new Date(dto.publishedAt);

    const trend = await this.trendModel
      .findByIdAndUpdate(trendId, update, { new: true })
      .lean<PlainTrend>()
      .exec();

    if (!trend) {
      throw new NotFoundException('Trend not found.');
    }

    return createApiResponse('Trend updated successfully.', trend);
  }

  async deleteTrend(id: string): Promise<ApiResponse<PlainTrend>> {
    const trendId = toObjectId(id, 'Trend id is invalid.');
    const trend = await this.trendModel
      .findByIdAndUpdate(trendId, { isActive: false }, { new: true })
      .lean<PlainTrend>()
      .exec();

    if (!trend) {
      throw new NotFoundException('Trend not found.');
    }

    return createApiResponse('Trend deleted successfully.', trend);
  }

  async findPublicFocusAreas(): Promise<
    ApiResponse<Array<{ name: string; slug: string }>>
  > {
    const focusAreas = await this.trendModel
      .aggregate<{ name: string; slug: string }>([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$focusAreaSlug',
            name: { $first: '$focusArea' },
            slug: { $first: '$focusAreaSlug' },
          },
        },
        { $sort: { name: 1 } },
        { $project: { _id: 0, name: 1, slug: 1 } },
      ])
      .exec();

    return createApiResponse('Trend focus areas retrieved successfully.', [
      { name: 'All', slug: 'all' },
      ...focusAreas,
    ]);
  }

  private async paginateTrends(
    filter: QueryFilter<TrendDocument>,
    query: QueryTrendsDto,
    message: string,
  ): Promise<ApiResponse<PlainTrend[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const [trends, total] = await Promise.all([
      this.trendModel
        .find(filter)
        .sort({ order: 1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainTrend[]>()
        .exec(),
      this.trendModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      trends,
      createPaginationMeta(page, limit, total),
    );
  }

  private buildTrendFilter(
    query: QueryTrendsDto,
    activeOnly = false,
  ): QueryFilter<TrendDocument> {
    const filter: QueryFilter<TrendDocument> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    if (query.focusArea && query.focusArea !== 'all') {
      filter.focusAreaSlug = slugify(query.focusArea);
    }

    if (typeof query.featured === 'boolean') {
      filter.isFeatured = query.featured;
    }

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { hashtags: { $regex: search, $options: 'i' } },
      ];
    }

    return filter;
  }

  private async resolveUniqueSlug(value: string): Promise<string> {
    const baseSlug = slugify(value);

    if (!baseSlug) {
      throw new BadRequestException('Slug could not be generated.');
    }

    let slug = baseSlug;
    let suffix = 2;

    while (await this.trendModel.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async resolveProvidedSlug(
    value: string,
    excludeId: string,
  ): Promise<string> {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestException('Slug could not be generated.');
    }

    const exists = await this.trendModel.exists({
      slug,
      _id: { $ne: toObjectId(excludeId, 'Trend id is invalid.') },
    });

    if (exists) {
      throw new ConflictException('Slug already exists.');
    }

    return slug;
  }
}
