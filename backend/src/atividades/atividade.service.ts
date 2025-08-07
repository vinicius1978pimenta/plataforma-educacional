import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';
import { AtividadeResponseDto } from './dto/atividade-response.dto';
import { TranslationService } from 'src/traducao/translation/translation.service';
import { TranslateAtividadeDto } from './dto/translate-atividade.dto';

@Injectable()
export class AtividadesService {
  
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  
  private normalizeAtividade(atividade: any): AtividadeResponseDto {
    return {
      ...atividade,
      pontuacao: atividade.pontuacao === null ? undefined : atividade.pontuacao,
    };
  }

  private normalizeAtividades(atividades: any[]): AtividadeResponseDto[] {
    return atividades.map(a => this.normalizeAtividade(a));
  }



  //traduçao 
  async translateAtividade(dto: TranslateAtividadeDto, user: any) {
  const { text, targetLang } = dto;

  const traducao = await this.translationService.translate(text, targetLang);

  return {
    original: text,
    traduzido: traducao,
    idioma: targetLang,
    por: user.name,
  };
}


  // Criar atividade (somente professor)
  async create(createAtividadeDto: CreateAtividadeDto, professorId: string): Promise<AtividadeResponseDto> {
    console.log('Dados recebidos para criação de atividade:', createAtividadeDto); 
    try {
      const usuario = await this.prisma.user.findUnique({
        where: { id: professorId },
        select: { role: true }
      });

      if (!usuario || usuario.role !== 'PROFESSOR') {
        throw new ForbiddenException('Apenas professores podem criar atividades');
      }

      if (createAtividadeDto.turmaId) {
        const turma = await this.prisma.turma.findFirst({
          where: {
            id: createAtividadeDto.turmaId,
            professorId: professorId
          }
        });

        if (!turma) {
          throw new NotFoundException('Turma não encontrada ou você não tem permissão para acessá-la');
        }
      }

      const atividade = await this.prisma.atividade.create({
        data: {
          ...createAtividadeDto,
          professorId,
          materialId: createAtividadeDto.materialId, // <-- Adicione esta linha
          dataVencimento: createAtividadeDto.dataVencimento ? new Date(createAtividadeDto.dataVencimento) : null,
        },
        include: {
          professor: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          turma: {
            select: {
              id: true,
              nome: true,
            }
          }
        }
      });

      return this.normalizeAtividade(atividade);
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar atividade: ' + error.message);
    }
  }

  // Listar atividades
async findAll(userId: string, userRole: string, materialId?: string): Promise<AtividadeResponseDto[]> {
  let whereClause: any = {};

  if (userRole === 'PROFESSOR') {
    whereClause = { professorId: userId };
  } else if (userRole === 'ALUNO') {
    whereClause = { ativa: true };
  } else {
    throw new ForbiddenException('Acesso negado');
  }

  // Agora filtramos pelo materialId corretamente
  if (materialId) {
    whereClause.materialId = materialId;
  }

  try {
    const atividades = await this.prisma.atividade.findMany({
      where: whereClause,
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        turma: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Atividades encontradas:', atividades);
    return this.normalizeAtividades(atividades);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    throw new Error('Erro ao buscar atividades.');
  }
}



  // Buscar atividade por ID
  async findOne(id: string, userId: string, userRole: string): Promise<AtividadeResponseDto> {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        turma: {
          select: {
            id: true,
            nome: true,
          }
        }
      }
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    if (userRole === 'PROFESSOR') {
      if (atividade.professorId !== userId) {
        throw new ForbiddenException('Você não tem permissão para acessar esta atividade');
      }
    } else if (userRole === 'ALUNO') {
      if (!atividade.turmaId) {
        throw new ForbiddenException('Esta atividade não está disponível para você');
      }

      const alunoNaTurma = await this.prisma.user.findFirst({
        where: {
          id: userId,
          turmas: {
            some: { id: atividade.turmaId }
          }
        }
      });

      if (!alunoNaTurma || !atividade.ativa) {
        throw new ForbiddenException('Você não tem permissão para acessar esta atividade');
      }
    }

    return this.normalizeAtividade(atividade);
  }

  // Atualizar atividade
  async update(id: string, updateAtividadeDto: UpdateAtividadeDto, professorId: string): Promise<AtividadeResponseDto> {
    const atividadeExistente = await this.prisma.atividade.findUnique({
      where: { id },
      select: { professorId: true, turmaId: true }
    });

    if (!atividadeExistente) {
      throw new NotFoundException('Atividade não encontrada');
    }

    if (atividadeExistente.professorId !== professorId) {
      throw new ForbiddenException('Você não tem permissão para editar esta atividade');
    }

    if (updateAtividadeDto.turmaId && updateAtividadeDto.turmaId !== atividadeExistente.turmaId) {
      const turma = await this.prisma.turma.findFirst({
        where: {
          id: updateAtividadeDto.turmaId,
          professorId: professorId
        }
      });

      if (!turma) {
        throw new NotFoundException('Turma não encontrada ou você não tem permissão para acessá-la');
      }
    }

    const atividade = await this.prisma.atividade.update({
      where: { id },
      data: {
        ...updateAtividadeDto,
        dataVencimento: updateAtividadeDto.dataVencimento ? new Date(updateAtividadeDto.dataVencimento) : undefined,
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        turma: {
          select: {
            id: true,
            nome: true,
          }
        }
      }
    });

    return this.normalizeAtividade(atividade);
  }

  // Remover atividade
  async remove(id: string, professorId: string): Promise<{ message: string }> {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id },
      select: { professorId: true }
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    if (atividade.professorId !== professorId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta atividade');
    }

    await this.prisma.atividade.delete({
      where: { id }
    });

    return { message: 'Atividade excluída com sucesso' };
  }

  // Listar atividades por turma
  async findByTurma(turmaId: string, professorId: string): Promise<AtividadeResponseDto[]> {
    const turma = await this.prisma.turma.findFirst({
      where: {
        id: turmaId,
        professorId: professorId
      }
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada ou você não tem permissão para acessá-la');
    }

    const atividades = await this.prisma.atividade.findMany({
      where: { turmaId },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        turma: {
          select: {
            id: true,
            nome: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return this.normalizeAtividades(atividades);
  }

 

}
