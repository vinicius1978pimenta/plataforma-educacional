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
import { ResponsavelService } from './responsavel.service';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateResponsavelPasswordDto } from './dto/update-responsavel-password.dto';

@Controller('responsaveis')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RESPONSAVEL)
export class ResponsavelController {
  constructor(private readonly responsavelService: ResponsavelService) {}

  //Atualizar dados gerais do Responsável

  @Patch(':id')
  async updateResponsavel(
    @Param('id') id: string,
    @Body() updateResponsavelDto: UpdateResponsavelDto,
    @CurrentUser() user: any,
  ) {
    return this.responsavelService.updateResponsavel(
      id,
      updateResponsavelDto,
      user,
    );
  }

  //Atualizar senha do Responsável
  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updateResponsavelPasswordDto: UpdateResponsavelPasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.responsavelService.updatePassword(
      id,
      updateResponsavelPasswordDto,
      user,
    );
  }
  //Deletar o acesso do Responsável
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.responsavelService.remove(id, user);
  }

  //Buscar um aluno em específico
  @Get('aluno/:id')
  async findOneAluno(@Param('id') id: string) {
    return this.responsavelService.findOneAluno(id);
  }

  @Get(':id/filhos')
  async findFilhosByResponsavelId(@Param('id') id: string) {
    return this.responsavelService.findFilhosByResponsavelId(id);
  }
  @Get(':id')
async findOne(@Param('id') id: string) {
  return this.responsavelService.findOne(id);
}
}
