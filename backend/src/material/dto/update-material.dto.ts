import { IsString, IsOptional } from 'class-validator';

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  conteudo?: string;

  @IsString()
  @IsOptional()
  traducao?: string;
}
