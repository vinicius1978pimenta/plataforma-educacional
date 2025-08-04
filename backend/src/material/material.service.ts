import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FiltroMaterialDto } from './dto/filtro-material.dto';
import { Role } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async create(createMaterialDto: CreateMaterialDto, professorId: string) {
    const professor = await this.prisma.user.findFirst({
      where: { id: professorId, role: Role.PROFESSOR },
    });

    if (!professor) {
      throw new UnauthorizedException('Apenas professores podem criar materiais.');
    }

    return this.prisma.material.create({
      data: {
        ...createMaterialDto,
        professor: {
          connect: { id: professorId },
        },
      },
    });
  }

  async findAll(filterDto: FiltroMaterialDto, userId: string, userRole: Role) {
    const where: any = {};

    if (filterDto.titulo) {
      where.titulo = { contains: filterDto.titulo, mode: 'insensitive' };
    }
    if (filterDto.traducao) {
      where.idioma = { equals: filterDto.traducao };
    }

    if (userRole === Role.PROFESSOR) {
      return this.prisma.material.findMany({
        where,
        include: { professor: { select: { id: true, name: true, email: true } } },
      });
    } else if (userRole === Role.ALUNO) {
      where.alunos = {
        some: {
          alunoId: userId,
        },
      };
      return this.prisma.material.findMany({
        where,
        include: { professor: { select: { id: true, name: true, email: true } } },
      });
    } else {
      throw new ForbiddenException('Você não tem permissão para listar materiais.');
    }
  }

  async findOne(id: string, user: { id: string, role: Role }) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        professor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID "${id}" não encontrado.`);
    }

    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto, professorId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      select: { professorId: true },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID "${id}" não encontrado.`);
    }

    if (material.professorId !== professorId) {
      throw new ForbiddenException('Você não tem permissão para editar este material.');
    }

    return this.prisma.material.update({
      where: { id },
      data: updateMaterialDto,
    });
  }

  async remove(id: string, professorId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      select: { professorId: true },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID "${id}" não encontrado.`);
    }

    if (material.professorId !== professorId) {
      throw new ForbiddenException('Você não tem permissão para excluir este material.');
    }

    await this.prisma.material.delete({
      where: { id },
    });

    return { message: 'Material excluído com sucesso.' };
  }
}