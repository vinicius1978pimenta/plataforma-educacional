import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';

export enum TipoAviso {
  GERAL = 'GERAL',
  URGENTE = 'URGENTE',
  EVENTO = 'EVENTO',
  LEMBRETE = 'LEMBRETE',
  COMUNICADO = 'COMUNICADO',
}

export enum PrioridadeAviso {
  BAIXA = 'BAIXA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export class CreateAvisoDto {
  @IsString()
  titulo: string;

  @IsString()
  conteudo: string;

  @IsOptional()
  @IsEnum(TipoAviso)
  tipo?: TipoAviso;

  @IsOptional()
  @IsEnum(PrioridadeAviso)
  prioridade?: PrioridadeAviso;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  turmaIds?: string[];

  @IsOptional()
  @IsDateString()
  dataExpiracao?: string;
}
