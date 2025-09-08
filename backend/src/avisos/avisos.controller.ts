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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AvisosService } from './avisos.service';
import { RolesGuard } from 'src/auth/guards/regras.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Controller('avisos')
@UseGuards(JwtAuthGuard)
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  create(@Body() createAvisoDto: CreateAvisoDto, @Request() req) {
    const professorId = req.user?.id || req.user?.sub;
    return this.avisosService.create(createAvisoDto, professorId);
  }

  @Get('professor/meus')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  findByProfessor(@Request() req) {
    const professorId = req.user?.id || req.user?.sub;
    return this.avisosService.findByProfessor(professorId);
  }

  @Get('aluno/meus')
  @UseGuards(RolesGuard)
  @Roles('ALUNO')
  findByAluno(@Request() req) {
    const alunoId = req.user?.id || req.user?.sub;
    return this.avisosService.findByAluno(alunoId);
  }

  @Get('responsavel/meus')
  @UseGuards(RolesGuard)
  @Roles('RESPONSAVEL')
  findByResponsavel(@Request() req) {
    const responsavelId = req.user?.id || req.user?.sub;
    return this.avisosService.findByResponsavel(responsavelId);
  }

  @Get('periodo')
  @UseGuards(RolesGuard)
  @Roles('ALUNO', 'PROFESSOR', 'RESPONSAVEL')
  findByPeriodo(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parâmetros dataInicio e dataFim são obrigatórios.');
    }
    return this.avisosService.findByPeriodo(dataInicio, dataFim);
  }

  @Get()
  findAll() {
    return this.avisosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avisosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  update(
    @Param('id') id: string,
    @Body() updateAvisoDto: UpdateAvisoDto,
    @Request() req,
  ) {
    const professorId = req.user?.id || req.user?.sub;
    return this.avisosService.update(id, updateAvisoDto, professorId);
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  toggleAtivo(@Param('id') id: string, @Request() req) {
    const professorId = req.user?.id || req.user?.sub;
    return this.avisosService.toggleAtivo(id, professorId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  remove(@Param('id') id: string, @Request() req) {
    const professorId = req.user?.id || req.user?.sub;
    return this.avisosService.remove(id, professorId);
  }
}
