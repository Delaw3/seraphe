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
  beautyTipExample,
  paginatedResponseExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { BeautyTipsService } from './beauty-tips.service';
import { CreateBeautyTipDto } from './dto/create-beauty-tip.dto';
import { QueryBeautyTipsDto } from './dto/query-beauty-tips.dto';
import { UpdateBeautyTipDto } from './dto/update-beauty-tip.dto';

@ApiTags('admin beauty tips')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/beauty-tips')
export class AdminBeautyTipsController {
  constructor(private readonly beautyTipsService: BeautyTipsService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create a beauty tip.',
    schema: {
      example: successResponseExample(
        'Beauty tip created successfully.',
        beautyTipExample,
      ),
    },
  })
  createTip(@Body() dto: CreateBeautyTipDto) {
    return this.beautyTipsService.createTip(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List beauty tips.',
    schema: {
      example: paginatedResponseExample(
        'Beauty tips retrieved successfully.',
        [beautyTipExample],
      ),
    },
  })
  findTips(@Query() query: QueryBeautyTipsDto) {
    return this.beautyTipsService.findAdminTips(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get one beauty tip.',
    schema: {
      example: successResponseExample(
        'Beauty tip retrieved successfully.',
        beautyTipExample,
      ),
    },
  })
  findTip(@Param('id') id: string) {
    return this.beautyTipsService.findAdminTip(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOkResponse({
    description: 'Update a beauty tip.',
    schema: {
      example: successResponseExample(
        'Beauty tip updated successfully.',
        beautyTipExample,
      ),
    },
  })
  updateTip(@Param('id') id: string, @Body() dto: UpdateBeautyTipDto) {
    return this.beautyTipsService.updateTip(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Delete a beauty tip.',
    schema: {
      example: successResponseExample(
        'Beauty tip deleted successfully.',
        beautyTipExample,
      ),
    },
  })
  deleteTip(@Param('id') id: string) {
    return this.beautyTipsService.deleteTip(id);
  }
}
