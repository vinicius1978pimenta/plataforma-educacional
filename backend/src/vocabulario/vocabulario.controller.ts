import { Controller, Get, Post, Body, Delete, UseGuards, Param } from '@nestjs/common';
import { VocabularioService } from './vocabulario.service';
import { VocabularioDto } from './dto-vocabulario/vacabulario-dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/regras.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; 
import { Role } from '@prisma/client';

@Controller('vocabulario')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ALUNO) 
export class VocabularioController {
  constructor(private readonly vocabuloService: VocabularioService) {}

  @Post()
  create(@Body() dto: VocabularioDto, @CurrentUser() user: any) { 
    return this.vocabuloService.create(dto, user.id); 
  }

  @Get()
  findAll(@CurrentUser() user: any) { 
    return this.vocabuloService.findAllByAluno(user.id); 
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) { 
    return this.vocabuloService.delete(id, user.id); 
  }
}