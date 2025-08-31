import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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
  constructor(private conteudoservice: ConteudoService) {}

  // Criar conteúdo texto (original)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Post()
  createConteudo(@Body() dto: ConteudoDTO, @CurrentUser() user: any) {
    return this.conteudoservice.create(dto, user.id);
  }

  // Upload de PDF
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('arquivo'))
  async uploadPdf(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    arquivo: Express.Multer.File,
    @Body() dados: { titulo: string; descricao: string; texto?: string; materialId: string },
    @CurrentUser() user: any
  ) {
    return this.conteudoservice.criarConteudoPdf(arquivo, dados, user.id);
  }

  // Criar conteúdo com link
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Post('link')
  async criarLink(
    @Body() dados: { titulo: string; descricao: string; texto?: string; url: string; materialId: string },
    @CurrentUser() user: any
  ) {
    return this.conteudoservice.criarConteudoLink(dados, user.id);
  }

  // Encontrar todos (original)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('materialId') materialId?: string  
  ) {
    if (user.role === Role.PROFESSOR) {
      return this.conteudoservice.findAllByProfessor(user.id, materialId);
    } else if (user.role === Role.ALUNO) {
      return this.conteudoservice.findAllByAluno(user.id, materialId);
    } else {
      throw new Error('Você não tem permissão para acessar os conteúdos');
    }
  }


  // Download de PDF
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/download')
  async downloadPdf(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: any) {
    return this.conteudoservice.downloadPdf(id, res, user.id, user.role);
  }

  // Atualizar conteúdo (original)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Put(':id')
  updateConteudo(
    @Param('id') id: string,
    @Body() dto: ConteudoUpdateDto,
    @CurrentUser() user: any
  ) {
    return this.conteudoservice.update(id, dto, user.id);
  }

  // Deletar (original)
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