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
  escapeRegex,
  omitInternalFields,
  slugify,
  toObjectId,
} from '../shop/shop.utils';
import { CreateBeautyTipDto } from './dto/create-beauty-tip.dto';
import { QueryBeautyTipsDto } from './dto/query-beauty-tips.dto';
import { UpdateBeautyTipDto } from './dto/update-beauty-tip.dto';
import {
  BeautyTip,
  BeautyTipDocument,
} from './schemas/beauty-tip.schema';

type PlainBeautyTip = BeautyTip & { _id: Types.ObjectId };

@Injectable()
export class BeautyTipsService {
  constructor(
    @InjectModel(BeautyTip.name)
    private readonly beautyTipModel: Model<BeautyTipDocument>,
  ) {}

  async createTip(dto: CreateBeautyTipDto): Promise<ApiResponse<PlainBeautyTip>> {
    const slug = await this.resolveUniqueSlug(dto.slug?.trim() || dto.title);
    const tip = await this.beautyTipModel.create({
      ...dto,
      title: dto.title.trim(),
      slug,
      category: dto.category.trim(),
      categorySlug: slugify(dto.category),
      level: dto.level.trim(),
      summary: dto.summary.trim(),
      content: dto.content.trim(),
      tags: dto.tags ?? [],
      isActive: true,
      order: dto.order ?? 0,
    });

    return createApiResponse('Beauty tip created successfully.', tip.toObject());
  }

  async findAdminTips(
    query: QueryBeautyTipsDto,
  ): Promise<ApiResponse<PlainBeautyTip[]>> {
    return this.paginateTips(
      this.buildTipFilter(query),
      query,
      'Beauty tips retrieved successfully.',
    );
  }

  async findPublicTips(
    query: QueryBeautyTipsDto,
  ): Promise<ApiResponse<PlainBeautyTip[]>> {
    const response = await this.paginateTips(
      this.buildTipFilter(query, true),
      query,
      'Beauty tips retrieved successfully.',
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findAdminTip(id: string): Promise<ApiResponse<PlainBeautyTip>> {
    const tip = await this.beautyTipModel
      .findById(toObjectId(id, 'Beauty tip id is invalid.'))
      .lean<PlainBeautyTip>()
      .exec();

    if (!tip) {
      throw new NotFoundException('Beauty tip not found.');
    }

    return createApiResponse(
      'Beauty tip retrieved successfully.',
      omitInternalFields(tip),
    );
  }

  async findPublicTipBySlug(slug: string): Promise<ApiResponse<PlainBeautyTip>> {
    const tip = await this.beautyTipModel
      .findOne({ slug, isActive: true })
      .lean<PlainBeautyTip>()
      .exec();

    if (!tip) {
      throw new NotFoundException('Beauty tip not found.');
    }

    return createApiResponse('Beauty tip retrieved successfully.', tip);
  }

  async updateTip(
    id: string,
    dto: UpdateBeautyTipDto,
  ): Promise<ApiResponse<PlainBeautyTip>> {
    const tipId = toObjectId(id, 'Beauty tip id is invalid.');
    const existing = await this.beautyTipModel.findById(tipId).lean().exec();

    if (!existing) {
      throw new NotFoundException('Beauty tip not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.title) {
      update.title = dto.title.trim();
    }

    delete update.slug;
    if (dto.slug?.trim()) {
      update.slug = await this.resolveProvidedSlug(dto.slug, id);
    }

    if (dto.category) {
      update.category = dto.category.trim();
      update.categorySlug = slugify(dto.category);
    }

    const tip = await this.beautyTipModel
      .findByIdAndUpdate(tipId, update, { new: true })
      .lean<PlainBeautyTip>()
      .exec();

    if (!tip) {
      throw new NotFoundException('Beauty tip not found.');
    }

    return createApiResponse('Beauty tip updated successfully.', tip);
  }

  async deleteTip(id: string): Promise<ApiResponse<PlainBeautyTip>> {
    const tipId = toObjectId(id, 'Beauty tip id is invalid.');
    const tip = await this.beautyTipModel
      .findByIdAndUpdate(tipId, { isActive: false }, { new: true })
      .lean<PlainBeautyTip>()
      .exec();

    if (!tip) {
      throw new NotFoundException('Beauty tip not found.');
    }

    return createApiResponse('Beauty tip deleted successfully.', tip);
  }

  async findPublicCategories(): Promise<
    ApiResponse<Array<{ name: string; slug: string }>>
  > {
    const categories = await this.beautyTipModel
      .aggregate<{ name: string; slug: string }>([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$categorySlug',
            name: { $first: '$category' },
            slug: { $first: '$categorySlug' },
          },
        },
        { $sort: { name: 1 } },
        { $project: { _id: 0, name: 1, slug: 1 } },
      ])
      .exec();

    return createApiResponse('Beauty tip categories retrieved successfully.', [
      { name: 'All', slug: 'all' },
      ...categories,
    ]);
  }

  private async paginateTips(
    filter: QueryFilter<BeautyTipDocument>,
    query: QueryBeautyTipsDto,
    message: string,
  ): Promise<ApiResponse<PlainBeautyTip[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const [tips, total] = await Promise.all([
      this.beautyTipModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainBeautyTip[]>()
        .exec(),
      this.beautyTipModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      tips,
      createPaginationMeta(page, limit, total),
    );
  }

  private buildTipFilter(
    query: QueryBeautyTipsDto,
    activeOnly = false,
  ): QueryFilter<BeautyTipDocument> {
    const filter: QueryFilter<BeautyTipDocument> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    if (query.category && query.category !== 'all') {
      filter.categorySlug = slugify(query.category);
    }

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
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

    while (await this.beautyTipModel.exists({ slug })) {
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

    const exists = await this.beautyTipModel.exists({
      slug,
      _id: { $ne: toObjectId(excludeId, 'Beauty tip id is invalid.') },
    });

    if (exists) {
      throw new ConflictException('Slug already exists.');
    }

    return slug;
  }
}
