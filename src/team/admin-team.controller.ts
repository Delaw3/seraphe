import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import {
  paginatedResponseExample,
  successResponseExample,
  teamMemberExample,
} from '../common/swagger-response.examples';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { QueryTeamMembersDto } from './dto/query-team-members.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamService } from './team.service';

@ApiTags('admin team')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/team')
export class AdminTeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create a team member.',
    schema: {
      example: successResponseExample(
        'Team member created successfully.',
        teamMemberExample,
      ),
    },
  })
  createMember(@Body() dto: CreateTeamMemberDto) {
    return this.teamService.createMember(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List team members.',
    schema: {
      example: paginatedResponseExample(
        'Team members retrieved successfully.',
        [teamMemberExample],
      ),
    },
  })
  findMembers(@Query() query: QueryTeamMembersDto) {
    return this.teamService.findAdminMembers(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get one team member.',
    schema: {
      example: successResponseExample(
        'Team member retrieved successfully.',
        teamMemberExample,
      ),
    },
  })
  findMember(@Param('id') id: string) {
    return this.teamService.findAdminMember(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOkResponse({
    description: 'Update a team member.',
    schema: {
      example: successResponseExample(
        'Team member updated successfully.',
        teamMemberExample,
      ),
    },
  })
  updateMember(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.teamService.updateMember(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Soft delete a team member.',
    schema: {
      example: successResponseExample(
        'Team member deleted successfully.',
        teamMemberExample,
      ),
    },
  })
  deleteMember(@Param('id') id: string) {
    return this.teamService.deleteMember(id);
  }
}
