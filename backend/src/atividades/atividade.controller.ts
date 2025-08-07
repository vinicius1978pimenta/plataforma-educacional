import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AtividadesService } from './atividade.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/regras.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TranslateAtividadeDto } from './dto/translate-atividade.dto';

@Controller('atividades')
@UseGuards(JwtAuthGuard)
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async create(@Body() createAtividadeDto: CreateAtividadeDto, @Request() req) {
    return this.atividadesService.create(createAtividadeDto, req.user.id);
  }

@Get()
async findAll(
  @Request() req,
  @Query('materialId') materialId: string,
) {
  return this.atividadesService.findAll(req.user.id, req.user.role, materialId);
}

  @Get('turma/:turmaId')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async findByTurma(@Param('turmaId') turmaId: string, @Request() req) {
    return this.atividadesService.findByTurma(turmaId, req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.atividadesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async update(
    @Param('id') id: string,
    @Body() updateAtividadeDto: UpdateAtividadeDto,
    @Request() req,
  ) {
    return this.atividadesService.update(id, updateAtividadeDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async remove(@Param('id') id: string, @Request() req) {
    return this.atividadesService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('translate')
  translateAtividade(
    @Body() dto: TranslateAtividadeDto,
    @CurrentUser() user: any, 
  ) {
    return this.atividadesService.translateAtividade(dto, user);
  }
}
