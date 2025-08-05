import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/regras.guard';
import { ProfessorService } from './professor.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { UpdateProfessorPasswordDto } from './dto/update-professor-password.dto';

@Controller('professores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROFESSOR)
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}

  //Atualizar dados gerais do professor
  @Patch(':id')
  async updateProfessor(
    @Param('id') id: string,
    @Body() updateProfessorDto: UpdateProfessorDto,
    @CurrentUser() user: any,
  ) {
    console.log(updateProfessorDto); //Verificar os dados da atualização
    return this.professorService.updateProfessor(id, updateProfessorDto, user);
  }

  //Atualizar senha do professor
  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordProfessorDto: UpdateProfessorPasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.professorService.updatePassword(
      id,
      updatePasswordProfessorDto,
      user,
    );
  }

  //Deletar o acesso do professor
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.professorService.remove(id, user);
  }

    //Buscar todos os alunos
  @Get('alunos')
  async findAllAlunos() {
     console.log("Buscando todos os alunos...");
    return this.professorService.findAllAlunos();
  }

  //Buscar um professor em específico
  @Get(':id')
  async findOneProfessor(@Param('id') id: string, @CurrentUser() user: any) {
    console.log('Buscando professor')
    return this.professorService.findOneProfessor(id, user);
  }

  //Buscar todos os professores
  @Get()
  async findAllProfessores() {
    return this.professorService.findAllProfessores();
  }

  //Buscar um aluno em específico
  @Get('aluno/:id')
  async findOneAluno(@Param('id') id: string) {
    return this.professorService.findOneAluno(id);
  }


  //Deleta um aluno específico
  @Delete(':id/aluno/:alunoId')
  async removeAluno(
    @Param('id') id: string,
    @Param('alunoId') alunoId: string,
    @CurrentUser() user: any,
  ) {
    return this.professorService.removeAluno(alunoId, user);
  }
}
