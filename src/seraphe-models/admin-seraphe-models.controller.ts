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
  serapheModelExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { CreateSerapheModelDto } from './dto/create-seraphe-model.dto';
import { QuerySerapheModelsDto } from './dto/query-seraphe-models.dto';
import { UpdateSerapheModelDto } from './dto/update-seraphe-model.dto';
import { SerapheModelsService } from './seraphe-models.service';

@ApiTags('admin seraphé models')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/seraphe-models')
export class AdminSerapheModelsController {
  constructor(private readonly serapheModelsService: SerapheModelsService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create a Seraphé model profile.',
    schema: {
      example: successResponseExample(
        'Seraphé model created successfully.',
        serapheModelExample,
      ),
    },
  })
  createModel(@Body() dto: CreateSerapheModelDto) {
    return this.serapheModelsService.createModel(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List Seraphé model profiles.',
    schema: {
      example: paginatedResponseExample(
        'Seraphé models retrieved successfully.',
        [serapheModelExample],
      ),
    },
  })
  findModels(@Query() query: QuerySerapheModelsDto) {
    return this.serapheModelsService.findAdminModels(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get one Seraphé model profile.',
    schema: {
      example: successResponseExample(
        'Seraphé model retrieved successfully.',
        serapheModelExample,
      ),
    },
  })
  findModel(@Param('id') id: string) {
    return this.serapheModelsService.findAdminModel(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOkResponse({
    description: 'Update a Seraphé model profile.',
    schema: {
      example: successResponseExample(
        'Seraphé model updated successfully.',
        serapheModelExample,
      ),
    },
  })
  updateModel(@Param('id') id: string, @Body() dto: UpdateSerapheModelDto) {
    return this.serapheModelsService.updateModel(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Soft delete a Seraphé model profile.',
    schema: {
      example: successResponseExample(
        'Seraphé model deleted successfully.',
        serapheModelExample,
      ),
    },
  })
  deleteModel(@Param('id') id: string) {
    return this.serapheModelsService.deleteModel(id);
  }
}
