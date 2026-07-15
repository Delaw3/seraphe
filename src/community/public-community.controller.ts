import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  communitySubscriberExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { CommunityService } from './community.service';
import { CreateCommunitySubscriberDto } from './dto/create-community-subscriber.dto';

@ApiTags('community')
@Controller('api/community')
export class PublicCommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('signup')
  @ApiCreatedResponse({
    description: 'Subscribe an email to the Seraphé community.',
    schema: {
      example: successResponseExample(
        'Community signup successful.',
        communitySubscriberExample,
      ),
    },
  })
  subscribe(@Body() dto: CreateCommunitySubscriberDto) {
    return this.communityService.subscribe(dto);
  }
}
