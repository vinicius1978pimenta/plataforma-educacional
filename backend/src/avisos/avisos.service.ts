import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Injectable()
export class AvisosService {
  constructor(private prisma: PrismaService) {}

  async create(createAvisoDto: CreateAvisoDto, professorId: string) {
    if (!professorId) {
      throw new ForbiddenException('Professor ID é obrigatório');
    }

    const { turmaIds, ...avisoData } = createAvisoDto;

    if (avisoData.dataExpiracao) {
      avisoData.dataExpiracao = new Date(avisoData.dataExpiracao).toISOString();
    }

    const aviso = await this.prisma.aviso.create({
      data: {
        ...avisoData,
        professorId,
        turmas: turmaIds
          ? {
              connect: turmaIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
    });

    return aviso;
  }


    
async findByResponsavel(responsavelId: string) {
  if (!responsavelId) {
    throw new ForbiddenException('Responsável ID é obrigatório');
  }

  // pega o responsável com TODOS os filhos e as turmas de cada filho
  const responsavel = await this.prisma.user.findUnique({
    where: { id: responsavelId },
    include: {
      filhos: {
        include: { turmas: true },
      },
    },
  });

  if (!responsavel) {
    throw new NotFoundException('Responsável não encontrado');
  }

  // junta os IDs de turmas de todos os filhos
  const turmaIds = Array.from(
    new Set(
      (responsavel.filhos ?? [])
        .flatMap(f => f.turmas ?? [])
        .map(t => t.id),
    ),
  );

  // mesma lógica do aluno: avisos gerais OU das turmas dos filhos, e não expirados
  return this.prisma.aviso.findMany({
    where: {
      ativo: true,
      AND: [
        {
          OR: [
            { turmas: { none: {} } },                         // gerais
            turmaIds.length ? { turmas: { some: { id: { in: turmaIds } } } } : { id: { not: '' } },
          ],
        },
        { OR: [{ dataExpiracao: null }, { dataExpiracao: { gte: new Date() } }] },
      ],
    },
    include: {
      professor: { select: { id: true, name: true, email: true } },
      turmas: { select: { id: true, nome: true } },
    },
    orderBy: [{ prioridade: 'desc' }, { createdAt: 'desc' }],
  });
}





  async findAll() {
    return this.prisma.aviso.findMany({
      where: { ativo: true },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
      orderBy: [{ prioridade: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByProfessor(professorId: string) {
    return this.prisma.aviso.findMany({
      where: { professorId },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAluno(alunoId: string) {
    if (!alunoId) {
      throw new ForbiddenException('Aluno ID é obrigatório');
    }

    // Busca avisos gerais (sem turma específica) ou avisos das turmas do aluno
    const aluno = await this.prisma.user.findUnique({
      where: { id: alunoId },
      include: { turmas: true },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const turmaIds = aluno.turmas.map((turma) => turma.id);

    return this.prisma.aviso.findMany({
      where: {
        ativo: true,
        AND: [
          {
            OR: [
              { turmas: { none: {} } }, // Avisos gerais (sem turma específica)
              { turmas: { some: { id: { in: turmaIds } } } }, // Avisos das turmas do aluno
            ],
          },
          {
            OR: [
              { dataExpiracao: null },
              { dataExpiracao: { gte: new Date() } },
            ],
          },
        ],
      },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
      orderBy: [{ prioridade: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const aviso = await this.prisma.aviso.findUnique({
      where: { id },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
    });

    if (!aviso) {
      throw new NotFoundException('Aviso não encontrado');
    }

    return aviso;
  }

  async update(
    id: string,
    updateAvisoDto: UpdateAvisoDto,
    professorId: string,
  ) {
    const aviso = await this.findOne(id);

    if (aviso.professorId !== professorId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este aviso',
      );
    }

    const { turmaIds, ...avisoData } = updateAvisoDto;

    // Converte dataExpiracao para formato ISO-8601 se fornecida
    if (avisoData.dataExpiracao) {
      avisoData.dataExpiracao = new Date(avisoData.dataExpiracao).toISOString();
    }

    return this.prisma.aviso.update({
      where: { id },
      data: {
        ...avisoData,
        turmas: turmaIds
          ? {
              set: turmaIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async remove(id: string, professorId: string) {
    const aviso = await this.findOne(id);

    if (aviso.professorId !== professorId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este aviso',
      );
    }

    return this.prisma.aviso.delete({
      where: { id },
    });
  }

  async toggleAtivo(id: string, professorId: string) {
    const aviso = await this.findOne(id);

    if (aviso.professorId !== professorId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este aviso',
      );
    }

    return this.prisma.aviso.update({
      where: { id },
      data: { ativo: !aviso.ativo },
      include: {
        professor: {
          select: { id: true, name: true, email: true },
        },
        turmas: {
          select: { id: true, nome: true },
        },
      },
    });
  }
}
