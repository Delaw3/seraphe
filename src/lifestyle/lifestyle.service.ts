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
import { CreateLifestyleArticleDto } from './dto/create-lifestyle-article.dto';
import { QueryLifestyleArticlesDto } from './dto/query-lifestyle-articles.dto';
import { UpdateLifestyleArticleDto } from './dto/update-lifestyle-article.dto';
import {
  LifestyleArticle,
  LifestyleArticleDocument,
} from './schemas/lifestyle-article.schema';

type PlainLifestyleArticle = LifestyleArticle & { _id: Types.ObjectId };

@Injectable()
export class LifestyleService {
  constructor(
    @InjectModel(LifestyleArticle.name)
    private readonly lifestyleArticleModel: Model<LifestyleArticleDocument>,
  ) {}

  async createArticle(
    dto: CreateLifestyleArticleDto,
  ): Promise<ApiResponse<PlainLifestyleArticle>> {
    const slug = await this.resolveUniqueSlug(dto.slug ?? dto.title);
    const article = await this.lifestyleArticleModel.create({
      ...dto,
      title: dto.title.trim(),
      slug,
      category: dto.category.trim(),
      categorySlug: slugify(dto.category),
      excerpt: dto.excerpt.trim(),
      content: dto.content.trim(),
      author: dto.author.trim(),
      tags: dto.tags ?? [],
      isFeatured: dto.isFeatured ?? false,
      isActive: true,
      order: dto.order ?? 0,
    });

    return createApiResponse(
      'Lifestyle article created successfully.',
      article.toObject(),
    );
  }

  async findAdminArticles(
    query: QueryLifestyleArticlesDto,
  ): Promise<ApiResponse<PlainLifestyleArticle[]>> {
    return this.paginateArticles(
      this.buildArticleFilter(query),
      query,
      'Lifestyle articles retrieved successfully.',
    );
  }

  async findPublicArticles(
    query: QueryLifestyleArticlesDto,
  ): Promise<ApiResponse<PlainLifestyleArticle[]>> {
    const response = await this.paginateArticles(
      this.buildArticleFilter(query, true),
      query,
      'Lifestyle articles retrieved successfully.',
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findAdminArticle(
    id: string,
  ): Promise<ApiResponse<PlainLifestyleArticle>> {
    const article = await this.lifestyleArticleModel
      .findById(toObjectId(id, 'Lifestyle article id is invalid.'))
      .lean<PlainLifestyleArticle>()
      .exec();

    if (!article) {
      throw new NotFoundException('Lifestyle article not found.');
    }

    return createApiResponse(
      'Lifestyle article retrieved successfully.',
      omitInternalFields(article),
    );
  }

  async findPublicArticleBySlug(
    slug: string,
  ): Promise<ApiResponse<PlainLifestyleArticle>> {
    const article = await this.lifestyleArticleModel
      .findOne({ slug, isActive: true })
      .lean<PlainLifestyleArticle>()
      .exec();

    if (!article) {
      throw new NotFoundException('Lifestyle article not found.');
    }

    return createApiResponse(
      'Lifestyle article retrieved successfully.',
      article,
    );
  }

  async updateArticle(
    id: string,
    dto: UpdateLifestyleArticleDto,
  ): Promise<ApiResponse<PlainLifestyleArticle>> {
    const articleId = toObjectId(id, 'Lifestyle article id is invalid.');
    const existing = await this.lifestyleArticleModel
      .findById(articleId)
      .lean()
      .exec();

    if (!existing) {
      throw new NotFoundException('Lifestyle article not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.title) {
      update.title = dto.title.trim();
    }

    if (dto.slug) {
      update.slug = await this.resolveProvidedSlug(dto.slug, id);
    }

    if (dto.category) {
      update.category = dto.category.trim();
      update.categorySlug = slugify(dto.category);
    }

    if (dto.excerpt) {
      update.excerpt = dto.excerpt.trim();
    }

    if (dto.content) {
      update.content = dto.content.trim();
    }

    if (dto.author) {
      update.author = dto.author.trim();
    }

    const article = await this.lifestyleArticleModel
      .findByIdAndUpdate(articleId, update, { new: true })
      .lean<PlainLifestyleArticle>()
      .exec();

    if (!article) {
      throw new NotFoundException('Lifestyle article not found.');
    }

    return createApiResponse('Lifestyle article updated successfully.', article);
  }

  async deleteArticle(id: string): Promise<ApiResponse<PlainLifestyleArticle>> {
    const articleId = toObjectId(id, 'Lifestyle article id is invalid.');
    const article = await this.lifestyleArticleModel
      .findByIdAndUpdate(articleId, { isActive: false }, { new: true })
      .lean<PlainLifestyleArticle>()
      .exec();

    if (!article) {
      throw new NotFoundException('Lifestyle article not found.');
    }

    return createApiResponse('Lifestyle article deleted successfully.', article);
  }

  async findPublicCategories(): Promise<
    ApiResponse<Array<{ name: string; slug: string }>>
  > {
    const categories = await this.lifestyleArticleModel
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

    return createApiResponse('Lifestyle categories retrieved successfully.', [
      { name: 'All Lifestyle', slug: 'all' },
      ...categories,
    ]);
  }

  private async paginateArticles(
    filter: QueryFilter<LifestyleArticleDocument>,
    query: QueryLifestyleArticlesDto,
    message: string,
  ): Promise<ApiResponse<PlainLifestyleArticle[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.lifestyleArticleModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainLifestyleArticle[]>()
        .exec(),
      this.lifestyleArticleModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      articles,
      createPaginationMeta(page, limit, total),
    );
  }

  private buildArticleFilter(
    query: QueryLifestyleArticlesDto,
    activeOnly = false,
  ): QueryFilter<LifestyleArticleDocument> {
    const filter: QueryFilter<LifestyleArticleDocument> = {};

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
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
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

    while (await this.lifestyleArticleModel.exists({ slug })) {
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

    const exists = await this.lifestyleArticleModel.exists({
      slug,
      _id: { $ne: toObjectId(excludeId, 'Lifestyle article id is invalid.') },
    });

    if (exists) {
      throw new ConflictException('Slug already exists.');
    }

    return slug;
  }
}
