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
import { CreateRespostaDto } from './dto/create-resposta.dto';

@Controller('atividades')
@UseGuards(JwtAuthGuard)
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  // --------- PROFESSOR ---------
  @Post()
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async create(@Body() dto: CreateAtividadeDto, @Request() req) {
    return this.atividadesService.create(dto, req.user.id);
  }

  @Get('turma/:turmaId')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async findByTurma(@Param('turmaId') turmaId: string, @Request() req) {
    return this.atividadesService.findByTurma(turmaId, req.user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAtividadeDto,
    @Request() req,
  ) {
    return this.atividadesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async remove(@Param('id') id: string, @Request() req) {
    return this.atividadesService.remove(id, req.user.id);
  }

  @Get(':id/respostas')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  async listarRespostas(@Param('id') id: string, @Request() req) {
    return this.atividadesService.listarRespostas(id, req.user.id);
  }

 
  @Get()
  async findAll(
    @Request() req,
    @Query('materialId') materialId?: string,
    @Query('alunoId') alunoId?: string, // opcional para RESPONSAVEL (relatório geral)
  ) {
    return this.atividadesService.findAll(
      req.user.id,
      req.user.role,
      materialId,
      alunoId,
    );
  }

  // Detalhe de atividade respeitando visibilidade por role
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.atividadesService.findOne(id, req.user.id, req.user.role);
  }

  // Tradução utilitária (mantido)
  @Post('translate')
  translateAtividade(
    @Body() dto: TranslateAtividadeDto,
    @CurrentUser() user: any,
  ) {
    return this.atividadesService.translateAtividade(dto, user);
  }

  // --------- PROFESSOR avalia resposta ---------
  @Patch('resposta/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESSOR')
  async registrarAvaliacao(
    @Param('id') id: string,
    @Body() avaliacaoDto: any,
    @Request() req,
  ) {
    return this.atividadesService.registrarAvaliacao(
      id,
      avaliacaoDto,
      req.user.id,
    );
  }

  // --------- ALUNO/RESPONSAVEL envia resposta ---------
  @Post('respostas')
  async criarResposta(
    @Body() dto: CreateRespostaDto,
    @CurrentUser() user: any,
  ) {
    return this.atividadesService.registrarResposta(
      dto.atividadeId,
      user.id,
      dto.resposta,
      dto.anexos ?? [],
    );
  }


  @Get(':id/minha-resposta')
  async minhaResposta(
    @Param('id') id: string,
    @Request() req,
    @Query('alunoId') alunoId?: string, // opcional para RESPONSAVEL (relatório geral)
  ) {
    return this.atividadesService.obterRespostaParaContexto(
      id,            // atividadeId
      req.user.id,   // quem está autenticado
      req.user.role, // role do token
      alunoId,       // opcional no modo geral do responsável
    );
  }
}
