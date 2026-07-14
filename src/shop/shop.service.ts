import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  AdminQueryProductsDto,
  QueryProductsDto,
} from './dto/query-products.dto';
import {
  AdminQueryReviewsDto,
  QueryReviewsDto,
} from './dto/query-reviews.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse } from './interfaces/api-response.interface';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import {
  createApiResponse,
  createPaginationMeta,
  escapeRegex,
  omitInternalFields,
  slugify,
  toBoolean,
  toObjectId,
} from './shop.utils';

type PlainCategory = Category & { _id: Types.ObjectId };
type PlainProduct = Product & {
  _id: Types.ObjectId;
  category?: Types.ObjectId | PlainCategory;
};
type PlainReview = Review & {
  _id: Types.ObjectId;
  product?: Types.ObjectId | PlainProduct;
};

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async createCategory(
    dto: CreateCategoryDto,
  ): Promise<ApiResponse<PlainCategory>> {
    const name = dto.name.trim();
    await this.ensureCategoryNameIsUnique(name);

    const slug = await this.resolveUniqueSlug(
      this.categoryModel,
      dto.slug ?? name,
    );

    const category = await this.categoryModel.create({
      ...dto,
      name,
      slug,
    });

    return createApiResponse('Category created successfully.', category.toObject());
  }

  async findAdminCategories(): Promise<ApiResponse<PlainCategory[]>> {
    const categories = await this.categoryModel
      .find()
      .sort({ order: 1, createdAt: -1 })
      .lean<PlainCategory[]>()
      .exec();

    return createApiResponse('Categories retrieved successfully.', categories);
  }

  async findPublicCategories(): Promise<ApiResponse<PlainCategory[]>> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean<PlainCategory[]>()
      .exec();

    return createApiResponse(
      'Categories retrieved successfully.',
      omitInternalFields(categories),
    );
  }

  async findAdminCategory(id: string): Promise<ApiResponse<PlainCategory>> {
    const category = await this.findCategoryById(id);
    return createApiResponse('Category retrieved successfully.', category);
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<ApiResponse<PlainCategory>> {
    const existing = await this.findCategoryById(id);
    const update: Partial<Category> = { ...dto };

    if (dto.name) {
      const name = dto.name.trim();
      await this.ensureCategoryNameIsUnique(name, id);
      update.name = name;
    }

    if (dto.slug) {
      update.slug = await this.resolveProvidedSlug(
        this.categoryModel,
        dto.slug,
        id,
      );
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(existing._id, update, { new: true })
      .lean<PlainCategory>()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return createApiResponse('Category updated successfully.', category);
  }

  async deleteCategory(id: string): Promise<ApiResponse<PlainCategory>> {
    const categoryId = toObjectId(id, 'Category id is invalid.');
    const category = await this.categoryModel
      .findByIdAndUpdate(categoryId, { isActive: false }, { new: true })
      .lean<PlainCategory>()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return createApiResponse('Category deleted successfully.', category);
  }

  async createProduct(dto: CreateProductDto): Promise<ApiResponse<PlainProduct>> {
    await this.ensureCategoryExists(dto.category);

    const slug = await this.resolveUniqueSlug(
      this.productModel,
      dto.slug ?? dto.name,
    );

    const product = await this.productModel.create({
      ...dto,
      name: dto.name.trim(),
      slug,
      category: new Types.ObjectId(dto.category),
      images: dto.images ?? [],
      tags: dto.tags ?? [],
      isFeatured: dto.isFeatured ?? false,
      isActive: true,
    });

    return createApiResponse('Product created successfully.', product.toObject());
  }

  async findAdminProducts(
    query: AdminQueryProductsDto,
  ): Promise<ApiResponse<PlainProduct[]>> {
    const filter = this.buildAdminProductFilter(query);
    return this.paginateProducts(
      filter,
      query,
      'Products retrieved successfully.',
      true,
    );
  }

  async findAdminProduct(id: string): Promise<ApiResponse<PlainProduct>> {
    const productId = toObjectId(id, 'Product id is invalid.');
    const product = await this.productModel
      .findById(productId)
      .populate('category')
      .lean<PlainProduct>()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return createApiResponse('Product retrieved successfully.', product);
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ApiResponse<PlainProduct>> {
    const productId = toObjectId(id, 'Product id is invalid.');
    const existing = await this.productModel.findById(productId).lean().exec();

    if (!existing) {
      throw new NotFoundException('Product not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.category) {
      await this.ensureCategoryExists(dto.category);
      update.category = new Types.ObjectId(dto.category);
    }

    if (dto.name) {
      update.name = dto.name.trim();
    }

    if (dto.slug) {
      update.slug = await this.resolveProvidedSlug(
        this.productModel,
        dto.slug,
        id,
      );
    }

    const product = await this.productModel
      .findByIdAndUpdate(productId, update, { new: true })
      .populate('category')
      .lean<PlainProduct>()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return createApiResponse('Product updated successfully.', product);
  }

  async deleteProduct(id: string): Promise<ApiResponse<PlainProduct>> {
    const productId = toObjectId(id, 'Product id is invalid.');
    const product = await this.productModel
      .findByIdAndUpdate(productId, { isActive: false }, { new: true })
      .populate('category')
      .lean<PlainProduct>()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return createApiResponse('Product deleted successfully.', product);
  }

  async getShopHome(): Promise<
    ApiResponse<{ categories: PlainCategory[]; featuredProducts: PlainProduct[] }>
  > {
    const [categories, featuredProducts] = await Promise.all([
      this.categoryModel
        .find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean<PlainCategory[]>()
        .exec(),
      this.productModel
        .find({ isActive: true, isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('category')
        .lean<PlainProduct[]>()
        .exec(),
    ]);

    return createApiResponse('Shop retrieved successfully.', omitInternalFields({
      categories,
      featuredProducts,
    }));
  }

  async findPublicProducts(
    query: QueryProductsDto,
  ): Promise<ApiResponse<PlainProduct[]>> {
    const filter = await this.buildPublicProductFilter(query);

    const response = await this.paginateProducts(
      filter,
      query,
      'Products retrieved successfully.',
      true,
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findPublicProductBySlug(
    slug: string,
  ): Promise<ApiResponse<{ product: PlainProduct; relatedProducts: PlainProduct[] }>> {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .populate('category')
      .lean<PlainProduct>()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const relatedProducts = await this.productModel
      .find({
        _id: { $ne: product._id },
        category: this.extractCategoryId(product.category),
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('category')
      .lean<PlainProduct[]>()
      .exec();

    return createApiResponse('Product retrieved successfully.', omitInternalFields({
      product,
      relatedProducts,
    }));
  }

  async createProductReview(
    slug: string,
    dto: CreateReviewDto,
  ): Promise<ApiResponse<PlainReview>> {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const review = await this.reviewModel.create({
      product: product._id,
      rating: dto.rating,
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      reviewText: dto.reviewText.trim(),
    });

    return createApiResponse('Review submitted successfully.', review.toObject());
  }

  async findProductReviewsBySlug(
    slug: string,
    query: QueryReviewsDto,
  ): Promise<ApiResponse<PlainReview[]>> {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return this.paginateReviews(
      { product: product._id },
      query,
      'Reviews retrieved successfully.',
      false,
    );
  }

  async findAdminReviews(
    query: AdminQueryReviewsDto,
  ): Promise<ApiResponse<PlainReview[]>> {
    const filter: QueryFilter<ReviewDocument> = {};

    if (query.product) {
      filter.product = toObjectId(query.product, 'Product id is invalid.');
    }

    return this.paginateReviews(
      filter,
      query,
      'Reviews retrieved successfully.',
      true,
    );
  }

  private async paginateProducts(
    filter: QueryFilter<ProductDocument>,
    query: QueryProductsDto,
    message: string,
    populateCategory = false,
  ): Promise<ApiResponse<PlainProduct[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const productQuery = this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (populateCategory) {
      productQuery.populate('category');
    }

    const [products, total] = await Promise.all([
      productQuery.lean<PlainProduct[]>().exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      products,
      createPaginationMeta(page, limit, total),
    );
  }

  private async paginateReviews(
    filter: QueryFilter<ReviewDocument>,
    query: QueryReviewsDto,
    message: string,
    populateProduct = false,
  ): Promise<ApiResponse<PlainReview[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const reviewQuery = this.reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (populateProduct) {
      reviewQuery.populate('product');
    }

    const [reviews, total] = await Promise.all([
      reviewQuery.lean<PlainReview[]>().exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      reviews,
      createPaginationMeta(page, limit, total),
    );
  }

  private buildAdminProductFilter(
    query: AdminQueryProductsDto,
  ): QueryFilter<ProductDocument> {
    const filter: QueryFilter<ProductDocument> = {};

    if (query.category) {
      filter.category = toObjectId(
        query.category,
        'Category id is invalid.',
      );
    }

    return this.applyProductSearchAndFeaturedFilter(filter, query);
  }

  private async buildPublicProductFilter(
    query: QueryProductsDto,
  ): Promise<QueryFilter<ProductDocument>> {
    const filter: QueryFilter<ProductDocument> = { isActive: true };

    if (query.category) {
      const category = await this.categoryModel
        .findOne({ slug: query.category, isActive: true })
        .select('_id')
        .lean<{ _id: Types.ObjectId }>()
        .exec();

      if (!category) {
        return { ...filter, category: new Types.ObjectId() };
      }

      filter.category = category._id;
    }

    return this.applyProductSearchAndFeaturedFilter(filter, query);
  }

  private applyProductSearchAndFeaturedFilter(
    filter: QueryFilter<ProductDocument>,
    query: QueryProductsDto,
  ): QueryFilter<ProductDocument> {
    const featured = toBoolean(query.featured);

    if (featured !== undefined) {
      filter.isFeatured = featured;
    }

    if (query.search) {
      filter.name = { $regex: query.search.trim(), $options: 'i' };
    }

    return filter;
  }

  private async findCategoryById(id: string): Promise<PlainCategory> {
    const categoryId = toObjectId(id, 'Category id is invalid.');
    const category = await this.categoryModel
      .findById(categoryId)
      .lean<PlainCategory>()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  private async ensureCategoryExists(id: string): Promise<void> {
    const categoryId = toObjectId(id, 'Category id is invalid.');
    const exists = await this.categoryModel.exists({ _id: categoryId });

    if (!exists) {
      throw new BadRequestException('Category does not exist.');
    }
  }

  private async ensureCategoryNameIsUnique(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<CategoryDocument> = {
      name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    };

    if (excludeId) {
      filter._id = { $ne: toObjectId(excludeId, 'Category id is invalid.') };
    }

    const exists = await this.categoryModel.exists(filter);

    if (exists) {
      throw new ConflictException('Category name already exists.');
    }
  }

  private async resolveUniqueSlug<T extends { slug: string }>(
    model: Model<T>,
    value: string,
  ): Promise<string> {
    const baseSlug = slugify(value);

    if (!baseSlug) {
      throw new BadRequestException('Slug could not be generated.');
    }

    let slug = baseSlug;
    let suffix = 2;

    while (await model.exists({ slug } as QueryFilter<T>)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async resolveProvidedSlug<T extends { slug: string }>(
    model: Model<T>,
    value: string,
    excludeId: string,
  ): Promise<string> {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestException('Slug could not be generated.');
    }

    const exists = await model.exists({
      slug,
      _id: { $ne: toObjectId(excludeId, 'Document id is invalid.') },
    } as QueryFilter<T>);

    if (exists) {
      throw new ConflictException('Slug already exists.');
    }

    return slug;
  }

  private extractCategoryId(
    category?: Types.ObjectId | PlainCategory,
  ): Types.ObjectId | undefined {
    if (!category) {
      return undefined;
    }

    return category instanceof Types.ObjectId ? category : category._id;
  }

}
