import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { PrismaService } from 'src/Prisma/prisma/prisma.service';
import { UpdateProfessorPasswordDto } from './dto/update-professor-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfessorService {
  constructor(private readonly prismaService: PrismaService) {}

  updateProfessor(
    id: string,
    updateProfessorDto: UpdateProfessorDto,
    user: any,
  ) {
    if (user.id !== id) {
      throw new Error('Você não tem permissão para atualizar esse professor!');
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateProfessorDto,
    });
  }

  async updatePassword(
    id: string,
    updatePasswordProfessorDto: UpdateProfessorPasswordDto,
    user: any,
  ) {
    if (user.id !== id) {
      throw new Error('Você não tem permissão para atualizar a senha!');
    }

    const professor = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!professor) {
      throw new Error('Professor não encontrado!');
    }

    const isOldPasswordValid = await bcrypt.compare(
      updatePasswordProfessorDto.oldPassword,
      professor.password,
    );
    if (!isOldPasswordValid) {
      throw new Error('Senha antiga incorreta!');
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordProfessorDto.newPassword,
      10,
    );

    return this.prismaService.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });
  }

  async remove(id: string, user: any) {
    if (user.id !== id) {
      throw new Error('Você não tem permissão para deletar esse professor!');
    }

    const professor = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!professor) {
      throw new Error('Professor não encontrado!');
    }

    return this.prismaService.user.delete({
      where: { id },
    });
  }

  async findOneProfessor(id: string, user: any) {
    const professor = await this.prismaService.user.findUnique({
      where: { id },
    });
/*
    if (!professor) {
      throw new Error('Professor não encontrado');
    }
*/
    return professor;
  }

  async findAllProfessores() {
    return this.prismaService.user.findMany({
      where: { role: 'PROFESSOR' },
    });
  }

  async findOneAluno(id: string) {
    const aluno = await this.prismaService.user.findUnique({
      where: { id: id, role: 'ALUNO' },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }
    return aluno;
  }

  async findAllAlunos() {
    return await this.prismaService.user.findMany({
      where: { role: 'ALUNO' },
    });
  }

  async removeAluno(alunoId: string, user: any) {
    const aluno = await this.prismaService.user.findUnique({
      where: {
        id: alunoId,
        role: 'ALUNO',
      },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado!');
    }
    return this.prismaService.user.delete({
      where: { id: alunoId },
    });
  }
}
