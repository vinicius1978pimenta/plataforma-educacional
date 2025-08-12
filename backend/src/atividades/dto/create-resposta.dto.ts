import { IsUUID, IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateRespostaDto {
  @IsUUID()
  atividadeId: string;

  @IsString()
  @MinLength(1)
  resposta: string;

  @IsOptional()
  @IsArray()
  anexos?: string[];
}