import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;
  @IsString()
  @IsNotEmpty()
  conteudo: string;
  @IsString()
  @IsOptional()
  traducao?: string;
}