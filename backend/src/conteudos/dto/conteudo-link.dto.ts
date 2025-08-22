import { IsOptional, IsString, IsUrl } from "class-validator";

export class ConteudoLinkDto {
  @IsString()
  titulo: string;

  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsUrl()
  url: string;

  @IsString()
  materialId: string;
}