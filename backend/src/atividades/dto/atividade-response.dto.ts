import { TipoAtividade, NivelDificuldade } from '@prisma/client';

export class AtividadeResponseDto {
  id: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  materia: string;
  tipo: TipoAtividade;
  dificuldade: NivelDificuldade;
  pontuacao?: number | null;
  tempoEstimado?: number;
  instrucoes?: string;
  dataVencimento?: Date | null;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
  professor: {
    id: string;
    name: string;
    email: string;
  };
  turma?: {
    id: string;
    nome: string;
  } | null;
}
