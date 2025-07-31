import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { VocabularioDto } from './dto-vocabulario/vacabulario-dto';

@Injectable()
export class VocabularioService {
  constructor(private prisma: PrismaService) {}

  create(dto: VocabularioDto, alunoId: string) {
    return this.prisma.vocabulo.create({
      data: {
        palavra: dto.palavra,
        traducao: dto.traducao,
        alunoId,
      },
    });
  }

  findAllByAluno(alunoId: string) {
    return this.prisma.vocabulo.findMany({
      where: { alunoId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async delete(id: string, alunoId: string) {
    // Verifica se a palavra existe e pertence ao aluno
    const palavra = await this.prisma.vocabulo.findFirst({
      where: { id, alunoId },
    });

    if (!palavra) {
      throw new NotFoundException('Palavra não encontrada ou não pertence a você');
    }

    // Deleta a palavra
    await this.prisma.vocabulo.delete({
      where: { id },
    });

    return {
      message: 'Palavra excluída com sucesso!',
      palavra: {
        id: palavra.id,
        palavra: palavra.palavra,
        traducao: palavra.traducao,
      }
    };
  }
}