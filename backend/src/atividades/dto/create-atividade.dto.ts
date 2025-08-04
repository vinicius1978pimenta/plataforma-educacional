// src/atividades/dto/create-atividade.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { TipoAtividade, NivelDificuldade } from '@prisma/client';

export class CreateAtividadeDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsString()
  @IsNotEmpty()
  materia: string;

  @IsEnum(TipoAtividade)
  @IsOptional()
  tipo?: TipoAtividade = TipoAtividade.EXERCICIO;

  @IsEnum(NivelDificuldade)
  @IsOptional()
  dificuldade?: NivelDificuldade = NivelDificuldade.MEDIO;

  @IsInt()
  @IsOptional()
  pontuacao?: number | null;

  @IsInt()
  @IsOptional()
  tempoEstimado?: number;

  @IsString()
  @IsOptional()
  instrucoes?: string;

  @IsString()
  @IsOptional()
  turmaId?: string;

  @IsDateString()
  @IsOptional()
  dataVencimento?: string;

  @IsOptional()
  ativa?: boolean;
}
