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
    const model = await this.serapheModelModel.create({
      name: dto.name.trim(),
      height: dto.height?.trim(),
      specialty: dto.specialty?.trim(),
      bio: dto.bio?.trim(),
      hobbies: dto.hobbies ?? [],
      featureImage: dto.featureImage.trim(),
      images: dto.images ?? [],
    });

    return createApiResponse(
      'Seraphe model created successfully.',
      model.toObject(),
    );
  }

  async findAdminModels(
    query: QuerySerapheModelsDto,
  ): Promise<ApiResponse<PlainSerapheModel[]>> {
    return this.paginateModels(
      this.buildModelFilter(query),
      query,
      'Seraphe models retrieved successfully.',
    );
  }

  async findPublicModels(
    query: QuerySerapheModelsDto,
  ): Promise<ApiResponse<PlainSerapheModel[]>> {
    const response = await this.paginateModels(
      this.buildModelFilter(query),
      query,
      'Seraphe models retrieved successfully.',
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findAdminModel(id: string): Promise<ApiResponse<PlainSerapheModel>> {
    const model = await this.serapheModelModel
      .findById(toObjectId(id, 'Seraphe model id is invalid.'))
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphe model not found.');
    }

    return createApiResponse('Seraphe model retrieved successfully.', model);
  }

  async findPublicModelById(
    id: string,
  ): Promise<ApiResponse<PlainSerapheModel>> {
    const model = await this.serapheModelModel
      .findById(toObjectId(id, 'Seraphe model id is invalid.'))
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphe model not found.');
    }

    return createApiResponse(
      'Seraphe model retrieved successfully.',
      omitInternalFields(model),
    );
  }

  async updateModel(
    id: string,
    dto: UpdateSerapheModelDto,
  ): Promise<ApiResponse<PlainSerapheModel>> {
    const modelId = toObjectId(id, 'Seraphe model id is invalid.');
    const existing = await this.serapheModelModel
      .findById(modelId)
      .lean()
      .exec();

    if (!existing) {
      throw new NotFoundException('Seraphe model not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.name) update.name = dto.name.trim();
    if (dto.height) update.height = dto.height.trim();
    if (dto.specialty) update.specialty = dto.specialty.trim();
    if (dto.bio) update.bio = dto.bio.trim();
    if (dto.featureImage) update.featureImage = dto.featureImage.trim();

    const model = await this.serapheModelModel
      .findByIdAndUpdate(modelId, update, { new: true })
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphe model not found.');
    }

    return createApiResponse('Seraphe model updated successfully.', model);
  }

  async deleteModel(id: string): Promise<ApiResponse<PlainSerapheModel>> {
    const model = await this.serapheModelModel
      .findByIdAndDelete(toObjectId(id, 'Seraphe model id is invalid.'))
      .lean<PlainSerapheModel>()
      .exec();

    if (!model) {
      throw new NotFoundException('Seraphe model not found.');
    }

    return createApiResponse('Seraphe model deleted successfully.', model);
  }

  async findPublicCategories(): Promise<
    ApiResponse<Array<{ name: string; slug: string }>>
  > {
    return createApiResponse(
      'Seraphe model categories retrieved successfully.',
      [],
    );
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
        .sort({ createdAt: -1 })
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
  ): QueryFilter<SerapheModelDocument> {
    const filter: QueryFilter<SerapheModelDocument> = {};

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { hobbies: { $regex: search, $options: 'i' } },
      ];
    }

    return filter;
  }
}
