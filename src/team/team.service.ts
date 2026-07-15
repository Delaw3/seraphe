import { Injectable, NotFoundException } from '@nestjs/common';
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
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { QueryTeamMembersDto } from './dto/query-team-members.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMember, TeamMemberDocument } from './schemas/team-member.schema';

type PlainTeamMember = TeamMember & { _id: Types.ObjectId };

type TeamSection = {
  name: string;
  slug: string;
  members: PlainTeamMember[];
};

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamMember.name)
    private readonly teamMemberModel: Model<TeamMemberDocument>,
  ) {}

  async createMember(
    dto: CreateTeamMemberDto,
  ): Promise<ApiResponse<PlainTeamMember>> {
    const member = await this.teamMemberModel.create({
      ...dto,
      name: dto.name.trim(),
      role: dto.role.trim(),
      section: dto.section.trim(),
      sectionSlug: slugify(dto.section),
      image: dto.image.trim(),
      bio: dto.bio?.trim(),
      email: dto.email?.toLowerCase().trim(),
      linkedin: dto.linkedin?.trim(),
      instagram: dto.instagram?.trim(),
      isActive: true,
      order: dto.order ?? 0,
    });

    return createApiResponse('Team member created successfully.', member.toObject());
  }

  async findAdminMembers(
    query: QueryTeamMembersDto,
  ): Promise<ApiResponse<PlainTeamMember[]>> {
    return this.paginateMembers(
      this.buildMemberFilter(query),
      query,
      'Team members retrieved successfully.',
    );
  }

  async findPublicMembers(
    query: QueryTeamMembersDto,
  ): Promise<ApiResponse<PlainTeamMember[]>> {
    const response = await this.paginateMembers(
      this.buildMemberFilter(query, true),
      query,
      'Team members retrieved successfully.',
    );

    return {
      ...response,
      data: omitInternalFields(response.data),
    };
  }

  async findPublicGroupedMembers(): Promise<ApiResponse<TeamSection[]>> {
    const members = await this.teamMemberModel
      .find({ isActive: true })
      .sort({ section: 1, order: 1, createdAt: -1 })
      .lean<PlainTeamMember[]>()
      .exec();

    const sections = members.reduce<TeamSection[]>((groups, member) => {
      const existing = groups.find((group) => group.slug === member.sectionSlug);

      if (existing) {
        existing.members.push(omitInternalFields(member));
        return groups;
      }

      groups.push({
        name: member.section,
        slug: member.sectionSlug,
        members: [omitInternalFields(member)],
      });

      return groups;
    }, []);

    return createApiResponse('Team sections retrieved successfully.', sections);
  }

  async findAdminMember(id: string): Promise<ApiResponse<PlainTeamMember>> {
    const member = await this.teamMemberModel
      .findById(toObjectId(id, 'Team member id is invalid.'))
      .lean<PlainTeamMember>()
      .exec();

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    return createApiResponse('Team member retrieved successfully.', member);
  }

  async updateMember(
    id: string,
    dto: UpdateTeamMemberDto,
  ): Promise<ApiResponse<PlainTeamMember>> {
    const memberId = toObjectId(id, 'Team member id is invalid.');
    const existing = await this.teamMemberModel.findById(memberId).lean().exec();

    if (!existing) {
      throw new NotFoundException('Team member not found.');
    }

    const update: Record<string, unknown> = { ...dto };

    if (dto.name) update.name = dto.name.trim();
    if (dto.role) update.role = dto.role.trim();
    if (dto.section) {
      update.section = dto.section.trim();
      update.sectionSlug = slugify(dto.section);
    }
    if (dto.image) update.image = dto.image.trim();
    if (dto.bio) update.bio = dto.bio.trim();
    if (dto.email) update.email = dto.email.toLowerCase().trim();
    if (dto.linkedin) update.linkedin = dto.linkedin.trim();
    if (dto.instagram) update.instagram = dto.instagram.trim();

    const member = await this.teamMemberModel
      .findByIdAndUpdate(memberId, update, { new: true })
      .lean<PlainTeamMember>()
      .exec();

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    return createApiResponse('Team member updated successfully.', member);
  }

  async deleteMember(id: string): Promise<ApiResponse<PlainTeamMember>> {
    const member = await this.teamMemberModel
      .findByIdAndUpdate(
        toObjectId(id, 'Team member id is invalid.'),
        { isActive: false },
        { new: true },
      )
      .lean<PlainTeamMember>()
      .exec();

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    return createApiResponse('Team member deleted successfully.', member);
  }

  async findPublicSections(): Promise<
    ApiResponse<Array<{ name: string; slug: string }>>
  > {
    const sections = await this.teamMemberModel
      .aggregate<{ name: string; slug: string }>([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$sectionSlug',
            name: { $first: '$section' },
            slug: { $first: '$sectionSlug' },
          },
        },
        { $sort: { name: 1 } },
        { $project: { _id: 0, name: 1, slug: 1 } },
      ])
      .exec();

    return createApiResponse('Team sections retrieved successfully.', sections);
  }

  private async paginateMembers(
    filter: QueryFilter<TeamMemberDocument>,
    query: QueryTeamMembersDto,
    message: string,
  ): Promise<ApiResponse<PlainTeamMember[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.teamMemberModel
        .find(filter)
        .sort({ section: 1, order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainTeamMember[]>()
        .exec(),
      this.teamMemberModel.countDocuments(filter).exec(),
    ]);

    return createApiResponse(
      message,
      members,
      createPaginationMeta(page, limit, total),
    );
  }

  private buildMemberFilter(
    query: QueryTeamMembersDto,
    activeOnly = false,
  ): QueryFilter<TeamMemberDocument> {
    const filter: QueryFilter<TeamMemberDocument> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    if (query.section && query.section !== 'all') {
      filter.sectionSlug = slugify(query.section);
    }

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    return filter;
  }
}
