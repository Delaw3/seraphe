import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import {
  communitySubscriberExample,
  paginatedResponseExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { CommunityService } from './community.service';
import { QueryCommunitySubscribersDto } from './dto/query-community-subscribers.dto';

@ApiTags('admin community')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/community/subscribers')
export class AdminCommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @ApiOkResponse({
    description: 'List community subscribers.',
    schema: {
      example: paginatedResponseExample(
        'Community subscribers retrieved successfully.',
        [communitySubscriberExample],
      ),
    },
  })
  findSubscribers(@Query() query: QueryCommunitySubscribersDto) {
    return this.communityService.findAdminSubscribers(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get one community subscriber.',
    schema: {
      example: successResponseExample(
        'Community subscriber retrieved successfully.',
        communitySubscriberExample,
      ),
    },
  })
  findSubscriber(@Param('id') id: string) {
    return this.communityService.findAdminSubscriber(id);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Soft delete a community subscriber.',
    schema: {
      example: successResponseExample(
        'Community subscriber removed successfully.',
        communitySubscriberExample,
      ),
    },
  })
  unsubscribe(@Param('id') id: string) {
    return this.communityService.unsubscribe(id);
  }
}
