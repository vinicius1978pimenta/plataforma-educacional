import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { PrismaService } from 'src/Prisma/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlunoService {
  constructor(private readonly prismaService: PrismaService) {}

  async update(id: string, updateAluno: UpdateAlunoDto) {
    const updatedAluno = await this.prismaService.user.update({
      where: { id },
      data: updateAluno,
    });
    return updatedAluno;
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string) {
    const aluno = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      aluno.password,
    );

    if (!isOldPasswordValid) {
      throw new NotFoundException('Senha antiga incorreta');
    }

    // Criptografa a nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha no banco
    await this.prismaService.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return true;
  }

  async find(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    try {
      const deletedAluno = await this.prismaService.user.delete({
        where: { id },
      });
      return deletedAluno;
    } catch (error) {
      throw new NotFoundException('Aluno não encontrado');
    }
  }
}
