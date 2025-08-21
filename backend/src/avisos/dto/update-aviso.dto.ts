import { PartialType } from '@nestjs/mapped-types';
import { CreateAvisoDto } from './create-aviso.dto';

export class UpdateAvisoDto extends PartialType(CreateAvisoDto) {}
