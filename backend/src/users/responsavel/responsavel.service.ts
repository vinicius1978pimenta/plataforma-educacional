import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';
import { PrismaService } from 'src/Prisma/prisma/prisma.service';
import { UpdateResponsavelPasswordDto } from './dto/update-responsavel-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResponsavelService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateResponsavel(
    id: string,
    updateResponsavelDto: UpdateResponsavelDto,
    user: any,
  ) {
    if (user.id !== id || user.role !== 'RESPONSAVEL') {
      throw new ForbiddenException('Você não tem permissão para esta ação.');
    }

    const responsavel = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!responsavel || responsavel.role !== 'RESPONSAVEL') {
      throw new NotFoundException('Responsável não encontrado.');
    }
    return this.prismaService.user.update({
      where: { id },
      data: updateResponsavelDto,
    });
  }

  async updatePassword(
    id: string,
    updateResponsavelPasswordDto: UpdateResponsavelPasswordDto,
    user: any,
  ) {
    if (user.id !== id) {
      throw new Error('Você não tem permissão para atualizar a senha!');
    }

    const responsavel = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!responsavel) {
      throw new Error('Responsável não encontrado!');
    }

    const isOldPasswordValid = await bcrypt.compare(
      updateResponsavelPasswordDto.oldPassword,
      responsavel.password,
    );
    if (!isOldPasswordValid) {
      throw new Error('Senha antiga incorreta!');
    }

    const hashedNewPassword = await bcrypt.hash(
      updateResponsavelPasswordDto.newPassword,
      10,
    );

    return this.prismaService.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });
  }

  async remove(id: string, user: any) {
    if (user.id !== id) {
      throw new Error('Você não tem permissão para apagar esta conta.');
    }

    const responsavel = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!responsavel) {
      throw new Error('Responsável não encontrado!');
    }

    return this.prismaService.user.delete({
      where: { id },
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

  async findFilhosByResponsavelId(responsavelId: string) {
    const responsavel = await this.prismaService.user.findUnique({
      where: { id: responsavelId, role: 'RESPONSAVEL' },
      include: { filhos: true }, // Inclui os filhos relacionados
    });

    if (!responsavel) {
      throw new NotFoundException('Responsável não encontrado');
    }

    return responsavel.filhos;
  }
  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id, role: 'RESPONSAVEL' },
    });
  }
}
