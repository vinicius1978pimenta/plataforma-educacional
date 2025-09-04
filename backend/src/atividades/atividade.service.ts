import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';
import { AtividadeResponseDto } from './dto/atividade-response.dto';
import { TranslationService } from 'src/traducao/translation/translation.service';
import { TranslateAtividadeDto } from './dto/translate-atividade.dto';
import { StatusResposta } from '@prisma/client';

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

  // --- Vinculação responsável ↔ aluno (ajuste à sua modelagem)
  private async assertVinculoResponsavelAluno(respId: string, alunoId: string) {
    const alunoDireto = await this.prisma.user.findFirst({
      where: { id: alunoId, responsavelId: respId },
      select: { id: true },
    });
    if (alunoDireto) return;

    const vinc = await (this.prisma as any).responsavelAluno?.findFirst?.({
      where: { responsavelId: respId, alunoId },
      select: { alunoId: true },
    });
    if (vinc) return;

    throw new ForbiddenException('Aluno não vinculado a este responsável');
  }

  // Tradução
  async translateAtividade(dto: TranslateAtividadeDto, user: any) {
    const { text, targetLang } = dto;
    const traducao = await this.translationService.translate(text, targetLang);
    return { original: text, traduzido: traducao, idioma: targetLang, por: user.name };
  }

  // Criar
  async create(createAtividadeDto: CreateAtividadeDto, professorId: string): Promise<AtividadeResponseDto> {
    try {
      const usuario = await this.prisma.user.findUnique({ where: { id: professorId }, select: { role: true } });
      if (!usuario || usuario.role !== 'PROFESSOR') throw new ForbiddenException('Apenas professores podem criar atividades');

      if (createAtividadeDto.turmaId) {
        const turma = await this.prisma.turma.findFirst({
          where: { id: createAtividadeDto.turmaId, professorId },
        });
        if (!turma) throw new NotFoundException('Turma não encontrada ou sem permissão');
      }

      const atividade = await this.prisma.atividade.create({
        data: {
          ...createAtividadeDto,
          professorId,
          materialId: createAtividadeDto.materialId,
          dataVencimento: createAtividadeDto.dataVencimento ? new Date(createAtividadeDto.dataVencimento) : null,
        },
        include: {
          professor: { select: { id: true, name: true, email: true } },
          turma: { select: { id: true, nome: true } },
        },
      });

      return this.normalizeAtividade(atividade);
    } catch (error: any) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Erro ao criar atividade: ' + error.message);
    }
  }

  // Listar (RESPONSAVEL agora pode ver modo geral sem alunoId)
  async findAll(
    userId: string,
    userRole: string,
    materialId?: string,
    alunoId?: string,
  ): Promise<AtividadeResponseDto[]> {
    let whereClause: any = {};

    if (userRole === 'PROFESSOR') {
      whereClause = { professorId: userId };
    } else if (userRole === 'ALUNO') {
      whereClause = { ativa: true };
    } else if (userRole === 'RESPONSAVEL') {
      if (!alunoId) {
        // MODO GERAL: não exige alunoId; mostra atividades ativas (e pode filtrar por materialId)
        whereClause = { ativa: true };
      } else {
        // MODO FILHO ESPECÍFICO (comportamento antigo)
        await this.assertVinculoResponsavelAluno(userId, alunoId);

        const turmasDoAluno = await this.prisma.turma.findMany({
          where: { alunos: { some: { id: alunoId } } },
          select: { id: true },
        });
        const turmaIds = turmasDoAluno.map(t => t.id);

        whereClause = {
          ativa: true,
          OR: [{ turmaId: null }, { turmaId: { in: turmaIds } }],
        };
      }
    } else {
      throw new ForbiddenException('Acesso negado');
    }

    if (materialId) whereClause.materialId = materialId;

    try {
      const atividades = await this.prisma.atividade.findMany({
        where: whereClause,
        include: {
          professor: { select: { id: true, name: true, email: true } },
          turma: { select: { id: true, nome: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return this.normalizeAtividades(atividades);
    } catch (error) {
      throw new Error('Erro ao buscar atividades.');
    }
  }

  // Buscar por ID (inclui regra para RESPONSAVEL no modo geral)
  async findOne(id: string, userId: string, userRole: string): Promise<AtividadeResponseDto> {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id },
      include: {
        professor: { select: { id: true, name: true, email: true } },
        turma: { select: { id: true, nome: true } },
      },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada');

    if (userRole === 'PROFESSOR') {
      if (atividade.professorId !== userId) throw new ForbiddenException('Sem permissão');
    } else if (userRole === 'ALUNO') {
      if (!atividade.turmaId) throw new ForbiddenException('Indisponível');
      const alunoNaTurma = await this.prisma.user.findFirst({
        where: { id: userId, turmas: { some: { id: atividade.turmaId } } },
      });
      if (!alunoNaTurma || !atividade.ativa) throw new ForbiddenException('Sem permissão');
    } else if (userRole === 'RESPONSAVEL') {
      // MODO GERAL: responsável pode ver atividades ativas (independente de turma)
      if (!atividade.ativa) throw new ForbiddenException('Indisponível');
    } else {
      throw new ForbiddenException('Acesso negado');
    }

    return this.normalizeAtividade(atividade);
  }

  // Atualizar
  async update(id: string, updateAtividadeDto: UpdateAtividadeDto, professorId: string): Promise<AtividadeResponseDto> {
    const atividadeExistente = await this.prisma.atividade.findUnique({
      where: { id },
      select: { professorId: true, turmaId: true },
    });
    if (!atividadeExistente) throw new NotFoundException('Atividade não encontrada');
    if (atividadeExistente.professorId !== professorId) throw new ForbiddenException('Sem permissão');

    if (updateAtividadeDto.turmaId && updateAtividadeDto.turmaId !== atividadeExistente.turmaId) {
      const turma = await this.prisma.turma.findFirst({
        where: { id: updateAtividadeDto.turmaId, professorId },
      });
      if (!turma) throw new NotFoundException('Turma não encontrada ou sem permissão');
    }

    const atividade = await this.prisma.atividade.update({
      where: { id },
      data: {
        ...updateAtividadeDto,
        dataVencimento: updateAtividadeDto.dataVencimento ? new Date(updateAtividadeDto.dataVencimento) : undefined,
      },
      include: {
        professor: { select: { id: true, name: true, email: true } },
        turma: { select: { id: true, nome: true } },
      },
    });
    return this.normalizeAtividade(atividade);
  }

  // Remover
  async remove(id: string, professorId: string): Promise<{ message: string }> {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id },
      select: { professorId: true },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada');
    if (atividade.professorId !== professorId) throw new ForbiddenException('Sem permissão');

    await this.prisma.atividade.delete({ where: { id } });
    return { message: 'Atividade excluída com sucesso' };
  }

  // Listar por turma
  async findByTurma(turmaId: string, professorId: string): Promise<AtividadeResponseDto[]> {
    const turma = await this.prisma.turma.findFirst({
      where: { id: turmaId, professorId },
    });
    if (!turma) throw new NotFoundException('Turma não encontrada ou sem permissão');

    const atividades = await this.prisma.atividade.findMany({
      where: { turmaId },
      include: {
        professor: { select: { id: true, name: true, email: true } },
        turma: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.normalizeAtividades(atividades);
  }

  async registrarAvaliacao(respostaId: string, avaliacaoDto: any, professorId: string) {
    const respostaExistente = await this.prisma.respostaAtividade.findUnique({
      where: { id: respostaId },
      include: { atividade: { select: { professorId: true } } },
    });
    if (!respostaExistente) throw new NotFoundException('Resposta não encontrada');
    if (respostaExistente.atividade.professorId !== professorId) throw new ForbiddenException('Sem permissão');

    const resposta = await this.prisma.respostaAtividade.update({
      where: { id: respostaId },
      data: {
        nota: avaliacaoDto.nota,
        feedback: avaliacaoDto.feedback,
        status: StatusResposta.CORRIGIDA,
        dataCorrecao: new Date(),
      },
      include: {
        aluno: { select: { id: true, name: true, email: true } },
        atividade: { select: { id: true, titulo: true } },
      },
    });
    return resposta;
  }

  async listarRespostas(atividadeId: string, professorId: string) {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id: atividadeId },
      select: { professorId: true },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada');
    if (atividade.professorId !== professorId) throw new ForbiddenException('Sem permissão');

    return this.prisma.respostaAtividade.findMany({
      where: { atividadeId },
      include: { aluno: { select: { id: true, name: true, email: true } } },
      orderBy: { dataEnvio: 'desc' },
    });
  }

  async obterMinhaResposta(atividadeId: string, alunoId: string) {
    const resposta = await this.prisma.respostaAtividade.findUnique({
      where: { atividadeId_alunoId: { atividadeId, alunoId } },
      select: {
        id: true,
        status: true,
        nota: true,
        feedback: true,
        dataEnvio: true,
        dataCorrecao: true,
      },
    });
    return resposta ?? null;
  }

  // --- Mesma rota para ALUNO e RESPONSAVEL (modo geral permite ausência de alunoId)
  async obterRespostaParaContexto(
    atividadeId: string,
    reqUserId: string,
    reqRole: string,
    alunoId?: string,
  ) {
    let alvoId = reqUserId;

    if (reqRole === 'ALUNO') {
      alvoId = reqUserId;
    } else if (reqRole === 'RESPONSAVEL') {
      if (!alunoId) {
        // MODO GERAL: não há resposta individual; devolve null
        // (ainda validamos a existência e disponibilidade da atividade)
        const atividade = await this.prisma.atividade.findUnique({
          where: { id: atividadeId },
          select: { ativa: true },
        });
        if (!atividade || !atividade.ativa) throw new ForbiddenException('Atividade indisponível');
        return null;
      }
      // MODO FILHO ESPECÍFICO
      await this.assertVinculoResponsavelAluno(reqUserId, alunoId);
      alvoId = alunoId;
    } else {
      throw new ForbiddenException('Apenas ALUNO ou RESPONSAVEL');
    }

    // valida visibilidade da atividade para o alvo quando há alvoId concreto
    const atividade = await this.prisma.atividade.findUnique({
      where: { id: atividadeId },
      select: { ativa: true, turmaId: true },
    });
    if (!atividade || !atividade.ativa) throw new ForbiddenException('Atividade indisponível');

    if (atividade.turmaId) {
      const alunoNaTurma = await this.prisma.turma.findFirst({
        where: { id: atividade.turmaId, alunos: { some: { id: alvoId } } },
        select: { id: true },
      });
      if (!alunoNaTurma) throw new ForbiddenException('Aluno fora da turma');
    }

    return this.obterMinhaResposta(atividadeId, alvoId);
  }

  async registrarResposta(
    atividadeId: string,
    alunoId: string,
    resposta: string,
    anexos: string[] = [],
  ) {
    const atividade = await this.prisma.atividade.findUnique({ where: { id: atividadeId } });
    if (!atividade) throw new NotFoundException('Atividade não encontrada');

    if (atividade.turmaId) {
      const alunoNaTurma = await this.prisma.turma.findFirst({
        where: { id: atividade.turmaId, alunos: { some: { id: alunoId } } },
        select: { id: true },
      });
      if (!alunoNaTurma) throw new ForbiddenException('Você não pertence à turma desta atividade');
    }

    const respostaCriada = await this.prisma.respostaAtividade.upsert({
      where: { atividadeId_alunoId: { atividadeId, alunoId } },
      create: { atividadeId, alunoId, resposta, anexos, status: StatusResposta.ENVIADA },
      update: { resposta, anexos, status: StatusResposta.ENVIADA, dataEnvio: new Date() },
    });

    return respostaCriada;
  }
}
