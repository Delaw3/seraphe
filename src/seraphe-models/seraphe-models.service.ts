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
import { CreateSerapheModelDto } from './dto/create-seraphe-model.dto';
import { QuerySerapheModelsDto } from './dto/query-seraphe-models.dto';
import { UpdateSerapheModelDto } from './dto/update-seraphe-model.dto';
import {
  SerapheModel,
  SerapheModelDocument,
} from './schemas/seraphe-model.schema';

type PlainSerapheModel = SerapheModel & { _id: Types.ObjectId };

@Injectable()
export class SerapheModelsService {
  constructor(
    @InjectModel(SerapheModel.name)
    private readonly serapheModelModel: Model<SerapheModelDocument>,
  ) {}

  async createModel(
    dto: CreateSerapheModelDto,
  ): Promise<ApiResponse<PlainSerapheModel>> {
    const slug = await this.resolveUniqueSlug(dto.slug?.trim() || dto.name);
    const model = await this.serapheModelModel.create({
      ...dto,
      name: dto.name.trim(),
      slug,
      category: dto.category.trim(),
      categorySlug: slugify(dto.category),
      badge: dto.badge?.trim(),
      location: dto.location.trim(),
      portfolioSummary: dto.portfolioSummary.trim(),
      bio: dto.bio?.trim(),
      height: dto.height?.trim(),
      bust: dto.bust?.trim(),
      waist: dto.waist?.trim(),
      chest: dto.chest?.trim(),
      featureImage: dto.featureImage.trim(),
      images: dto.images ?? [],
      tags: dto.tags ?? [],
      isFeatured: dto.isFeatured ?? false,
      isActive: true,
      order: dto.order ?? 0,
    });

    return createApiResponse(
      'Seraphé model created successfully.',
      model.toObject(),
    );
  }

  async findAdminModels(
    query: QuerySerapheModelsDto,
  ): Promise<ApiResponse<PlainSerapheModel[]>> {
    return this.paginateModels(
      this.buildModelFilter(query),
      query,
      'Seraphé models retrieved successfully.',
    );
  }

  async findPublicModels(
    query: QuerySerapheModelsDto,
  ): Promise<ApiResponse<PlainSerapheModel[]>> {
    const response = await this.paginateModels(
      this.buildModelFilter(query, true),
      query,
      'Seraphé models retrieved successfully.',
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findAdminModel(id: string): Promise<ApiResponse<PlainSerapheModel>> {
    const model = await this.serapheModelModel
      .findById(toObjectId(id, 'Seraphé model id is invalid.'))
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphé model not found.');
    }

    return createApiResponse('Seraphé model retrieved successfully.', model);
  }

  async findPublicModelBySlug(
    slug: string,
  ): Promise<ApiResponse<PlainSerapheModel>> {
    const model = await this.serapheModelModel
      .findOne({ slug, isActive: true })
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphé model not found.');
    }

    return createApiResponse(
      'Seraphé model retrieved successfully.',
      omitInternalFields(model),
    );
  }

  async updateModel(
    id: string,
    dto: UpdateSerapheModelDto,
  ): Promise<ApiResponse<PlainSerapheModel>> {
    const modelId = toObjectId(id, 'Seraphé model id is invalid.');
    const existing = await this.serapheModelModel.findById(modelId).lean().exec();

    if (!existing) {
      throw new NotFoundException('Seraphé model not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.name) {
      update.name = dto.name.trim();
    }

    delete update.slug;
    if (dto.slug?.trim()) {
      update.slug = await this.resolveProvidedSlug(dto.slug, id);
    }

    if (dto.category) {
      update.category = dto.category.trim();
      update.categorySlug = slugify(dto.category);
    }

    if (dto.badge) update.badge = dto.badge.trim();
    if (dto.location) update.location = dto.location.trim();
    if (dto.portfolioSummary) {
      update.portfolioSummary = dto.portfolioSummary.trim();
    }
    if (dto.bio) update.bio = dto.bio.trim();
    if (dto.height) update.height = dto.height.trim();
    if (dto.bust) update.bust = dto.bust.trim();
    if (dto.waist) update.waist = dto.waist.trim();
    if (dto.chest) update.chest = dto.chest.trim();
    if (dto.featureImage) update.featureImage = dto.featureImage.trim();

    const model = await this.serapheModelModel
      .findByIdAndUpdate(modelId, update, { new: true })
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphé model not found.');
    }

    return createApiResponse('Seraphé model updated successfully.', model);
  }

  async deleteModel(id: string): Promise<ApiResponse<PlainSerapheModel>> {
    const modelId = toObjectId(id, 'Seraphé model id is invalid.');
    const model = await this.serapheModelModel
      .findByIdAndUpdate(modelId, { isActive: false }, { new: true })
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphé model not found.');
    }

    return createApiResponse('Seraphé model deleted successfully.', model);
  }

  async findPublicCategories(): Promise<
    ApiResponse<Array<{ name: string; slug: string }>>
  > {
    const categories = await this.serapheModelModel
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

    return createApiResponse('Seraphé model categories retrieved successfully.', [
      { name: 'All', slug: 'all' },
      ...categories,
    ]);
  }

  private async paginateModels(
    filter: QueryFilter<SerapheModelDocument>,
    query: QuerySerapheModelsDto,
    message: string,
  ): Promise<ApiResponse<PlainSerapheModel[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const [models, total] = await Promise.all([
      this.serapheModelModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainSerapheModel[]>()
        .exec(),
      this.serapheModelModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      models,
      createPaginationMeta(page, limit, total),
    );
  }

  private buildModelFilter(
    query: QuerySerapheModelsDto,
    activeOnly = false,
  ): QueryFilter<SerapheModelDocument> {
    const filter: QueryFilter<SerapheModelDocument> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    if (query.category && query.category !== 'all') {
      filter.categorySlug = slugify(query.category);
    }

    if (typeof query.featured === 'boolean') {
      filter.isFeatured = query.featured;
    }

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { portfolioSummary: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
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

    while (await this.serapheModelModel.exists({ slug })) {
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

    const exists = await this.serapheModelModel.exists({
      slug,
      _id: { $ne: toObjectId(excludeId, 'Seraphé model id is invalid.') },
    });

    if (exists) {
      throw new ConflictException('Slug already exists.');
    }

    return slug;
  }
}
