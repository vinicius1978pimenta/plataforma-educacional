import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, UseGuards } from '@nestjs/common';
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

  @Patch(':id')
  async update(@Param('id') id:string, @Body() updateAlunoDto: UpdateAlunoDto,  @CurrentUser() user: any){
    const updatedAluno = await this.alunoService.update(id, updateAlunoDto);
    return updatedAluno;
    };

  @Patch(':id/changepassword')
  async updatePassword(@Param('id') id:string, @Body() updatePasswordDto: UpdatePasswordDto, @CurrentUser() user: any){
    await this.alunoService.updatePassword(id, updatePasswordDto.oldPassword, updatePasswordDto.newPassword);
    return{message: "Senha alterada com sucesso!"}
  }


  @Get()
  async find(@CurrentUser() user: any){
    return this.alunoService.find(user.id);
  }

  @Delete(':id')
  async remove (@Param('id') id: string, @CurrentUser() user: any){
    await this.alunoService.remove(id);
    return{message: "Conta excluída com sucesso!"}
  }

  }
 
 
