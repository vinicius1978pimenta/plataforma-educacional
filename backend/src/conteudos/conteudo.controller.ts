import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ConteudoService } from './conteudo.service';
import { ConteudoDTO } from './dto/conteudo-dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RolesGuard } from 'src/auth/guards/regras.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ConteudoUpdateDto } from './dto/conteudo-update-dto';

@Controller('conteudo')
export class ConteudoController {

 constructor(private conteudoservice : ConteudoService){}
  //criar 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Post()
  createConteudo(@Body() dto: ConteudoDTO, @CurrentUser() user: any) {
    return this.conteudoservice.create(dto, user.id); 
  }
  //encontrar
 @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    if (user.role === Role.PROFESSOR) {
      return this.conteudoservice.findAllByProfessor(user.id);
    } else if (user.role === Role.ALUNO) {
      return this.conteudoservice.findAllByAluno(user.id);
    } else {
      throw new Error('Você não tem permissão para acessar os conteúdos');
    }
  }


  //att conteudo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Put(':id')
  updateConteudo(
  @Param('id') id: string,
  @Body() dto: ConteudoUpdateDto,
  @CurrentUser() user: any
 ){
  return this.conteudoservice.update(id, dto, user.id);
  }

  //deletar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Delete(':id')
  deleteConteudo(
  @Param('id') id: string,
  @CurrentUser() user: any
) {
  return this.conteudoservice.delete(id, user.id);
}



}
