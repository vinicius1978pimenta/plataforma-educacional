import { IsString, IsOptional } from 'class-validator';

export class FiltroMaterialDto {
  @IsString()
  @IsOptional()
  titulo?: string;
  @IsString()
  @IsOptional()
  traducao?: string;
}
