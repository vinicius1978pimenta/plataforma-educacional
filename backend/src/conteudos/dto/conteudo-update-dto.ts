import { IsString, IsOptional, IsUrl } from "class-validator";

export class ConteudoUpdateDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}