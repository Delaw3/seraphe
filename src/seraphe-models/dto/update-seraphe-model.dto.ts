import { PartialType } from '@nestjs/swagger';
import { CreateSerapheModelDto } from './create-seraphe-model.dto';

export class UpdateSerapheModelDto extends PartialType(CreateSerapheModelDto) {}
