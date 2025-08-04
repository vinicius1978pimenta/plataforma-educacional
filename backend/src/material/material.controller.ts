import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FiltroMaterialDto } from './dto/filtro-material.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/regras.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('material')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @Roles(Role.PROFESSOR)
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser('id') professorId: string,
  ) {
    return this.materialService.create(createMaterialDto, professorId);
  }

  @Get()
  @Roles(Role.PROFESSOR, Role.ALUNO)
  findAll(
    @Query() filterDto: FiltroMaterialDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.materialService.findAll(filterDto, userId, userRole);
  }

  @Get(':id')
  @Roles(Role.PROFESSOR, Role.ALUNO)
  findOne(
      @Param('id', ParseUUIDPipe) id: string,
      @CurrentUser() user: { id: string, role: Role }
    ) {
    return this.materialService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.PROFESSOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @CurrentUser('id') professorId: string,
  ) {
    return this.materialService.update(id, updateMaterialDto, professorId);
  }

  @Delete(':id')
  @Roles(Role.PROFESSOR) 
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') professorId: string,
  ) {
    return this.materialService.remove(id, professorId);
  }
}
