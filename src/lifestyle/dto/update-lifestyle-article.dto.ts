import { PartialType } from '@nestjs/swagger';
import { CreateLifestyleArticleDto } from './create-lifestyle-article.dto';

export class UpdateLifestyleArticleDto extends PartialType(
  CreateLifestyleArticleDto,
) {}
