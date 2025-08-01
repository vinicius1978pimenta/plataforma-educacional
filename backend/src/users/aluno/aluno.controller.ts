import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AlunoService } from './aluno.service';
import { RolesGuard } from 'src/auth/guards/regras.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('alunos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ALUNO)
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  //Atualiza dados gerais do aluno
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAlunoDto: UpdateAlunoDto,
    @CurrentUser() user: any,
  ) {
    const updatedAluno = await this.alunoService.update(
      id,
      updateAlunoDto,
      user,
    );
    return updatedAluno;
  }

  //Atualiza senha do aluno
  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: any,
  ) {
    await this.alunoService.updatePassword(
      id,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword,
      user,
    );
    return { message: 'Senha alterada com sucesso!' };
  }

  //Busca um aluno em específico
  @Get(':id')
  async find(@Param('id') id: string, @CurrentUser() user: any) {
    return this.alunoService.find(id, user);
  }

  //Deleta acesso do aluno específico
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.alunoService.remove(id, user);
    return { message: 'Conta excluída com sucesso!' };
  }
}
