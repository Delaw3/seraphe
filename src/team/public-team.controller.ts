import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  paginatedResponseExample,
  teamMemberExample,
  teamSectionsResponseExample,
  teamGroupedResponseExample,
} from '../common/swagger-response.examples';
import { QueryTeamMembersDto } from './dto/query-team-members.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('api/team')
export class PublicTeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOkResponse({
    description: 'List active team members.',
    schema: {
      example: paginatedResponseExample(
        'Team members retrieved successfully.',
        [teamMemberExample],
      ),
    },
  })
  findMembers(@Query() query: QueryTeamMembersDto) {
    return this.teamService.findPublicMembers(query);
  }

  @Get('grouped')
  @ApiOkResponse({
    description: 'List active team members grouped by section.',
    schema: { example: teamGroupedResponseExample },
  })
  findGroupedMembers() {
    return this.teamService.findPublicGroupedMembers();
  }

  @Get('sections')
  @ApiOkResponse({
    description: 'List team sections.',
    schema: { example: teamSectionsResponseExample },
  })
  findSections() {
    return this.teamService.findPublicSections();
  }
}
