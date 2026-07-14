import { PartialType } from '@nestjs/swagger';
import { CreateBeautyTipDto } from './create-beauty-tip.dto';

export class UpdateBeautyTipDto extends PartialType(CreateBeautyTipDto) {}
