
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma/prisma.service';
import { Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConteudoDTO } from './dto/conteudo-dto';
import { ConteudoUpdateDto } from './dto/conteudo-update-dto';
import { Role } from '@prisma/client';

@Injectable()
export class ConteudoService {
  private readonly uploadDir = './uploads/pdfs';

  constructor(private readonly prismaservice: PrismaService) {
    this.criarDiretorioUpload();
  }

  private async criarDiretorioUpload() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Erro ao criar diretório de upload:', error);
    }
  }

  // Método original - criar conteúdo texto
  async create(dto: ConteudoDTO, professorId: string) {
    const material = await this.prismaservice.material.findUnique({
      where: { id: dto.materialId },
    });

    if (!material) {
      throw new Error('Material não encontrado');
    }

    if (material.professorId !== professorId) {
      throw new Error('Você não tem permissão para usar este material');
    }

    return await this.prismaservice.conteudo.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        texto: dto.texto,
        materialId: dto.materialId,
        professorId: professorId,
        tipo: 'TEXTO',
      },
      include: { material: true },
    });
  }

  // Novo método - criar conteúdo com PDF
  async criarConteudoPdf(
    arquivo: Express.Multer.File,
    dados: { titulo: string; descricao: string; texto?: string; materialId: string },
    professorId: string,
  ) {
    // Verificar se o material pertence ao professor
    const material = await this.prismaservice.material.findUnique({
      where: { id: dados.materialId },
    });

    if (!material) {
      throw new BadRequestException('Material não encontrado');
    }

    if (material.professorId !== professorId) {
      throw new BadRequestException('Você não tem permissão para usar este material');
    }

    try {
      // Gerar nome único para o arquivo
      const nomeArquivo = `${Date.now()}-${arquivo.originalname}`;
      const caminhoCompleto = path.join(this.uploadDir, nomeArquivo);

      // Salvar arquivo no sistema
      await fs.writeFile(caminhoCompleto, arquivo.buffer);

      // Salvar informações no banco
      const conteudo = await this.prismaservice.conteudo.create({
        data: {
          titulo: dados.titulo,
          descricao: dados.descricao,
          texto: dados.texto || '',
          tipo: 'PDF',
          nomeArquivo: arquivo.originalname,
          caminhoArquivo: caminhoCompleto,
          tamanho: arquivo.size,
          materialId: dados.materialId,
          professorId: professorId,
        },
        include: { material: true, professor: true },
      });

      return conteudo;
    } catch (error) {
      throw new BadRequestException('Erro ao salvar PDF: ' + error.message);
    }
  }

  // Novo método - criar conteúdo com link
  async criarConteudoLink(
    dados: { titulo: string; descricao: string; texto?: string; url: string; materialId: string },
    professorId: string,
  ) {
    // Verificar se o material pertence ao professor
    const material = await this.prismaservice.material.findUnique({
      where: { id: dados.materialId },
    });

    if (!material) {
      throw new BadRequestException('Material não encontrado');
    }

    if (material.professorId !== professorId) {
      throw new BadRequestException('Você não tem permissão para usar este material');
    }

    return await this.prismaservice.conteudo.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao,
        texto: dados.texto || '',
        tipo: 'LINK',
        url: dados.url,
        materialId: dados.materialId,
        professorId: professorId,
      },
      include: { material: true, professor: true },
    });
  }

  // Métodos originais atualizados para incluir novos campos
  async findAllByAluno(alunoId: string, materialId?: string) {
    
    return await this.prismaservice.conteudo.findMany({
      where: {
        // Mantém apenas o filtro por materialId
        ...(materialId && { materialId: materialId }),
      },
      include: { 
        material: true, 
        professor: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

async findAllByProfessor(professorId: string, materialId?: string) {
  return await this.prismaservice.conteudo.findMany({
    where: {
      professorId,
      // CORRIGIDO: Filtrar pelo materialId diretamente
      ...(materialId && { materialId: materialId }),
    },
    include: { 
      material: true, 
      professor: true 
    },
    orderBy: { createdAt: 'desc' },
  });
}

  // Novo método - download de PDF
  async downloadPdf(id: string, res: Response, userId: string, userRole: Role) {
    const conteudo = await this.prismaservice.conteudo.findUnique({
      where: { id },
      include: { alunos: true },
    });

    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }

    // Verificar permissões
    const temPermissao = 
      userRole === Role.PROFESSOR && conteudo.professorId === userId ||
      userRole === Role.ALUNO && conteudo.alunos.some(aluno => aluno.id === userId);

    if (!temPermissao) {
      throw new BadRequestException('Você não tem permissão para acessar este conteúdo');
    }

    if (conteudo.tipo !== 'PDF' || !conteudo.caminhoArquivo) {
      throw new BadRequestException('Este conteúdo não é um PDF');
    }

    try {
      await fs.access(conteudo.caminhoArquivo);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${conteudo.nomeArquivo}"`,
      );

      const arquivo = await fs.readFile(conteudo.caminhoArquivo);
      res.send(arquivo);
    } catch (error) {
      throw new NotFoundException('Arquivo PDF não encontrado');
    }
  }

  // Método original de atualização
  async update(id: string, dto: ConteudoUpdateDto, professorId: string) {
    const conteudo = await this.prismaservice.conteudo.findUnique({
      where: { id },
    });

    if (!conteudo) {
      throw new Error('Conteúdo não encontrado');
    }

    if (conteudo.professorId !== professorId) {
      throw new Error('Você não tem permissão para atualizar este conteúdo');
    }

    return await this.prismaservice.conteudo.update({
      where: { id },
      data: {
        ...dto,
        professorId,
      },
      include: { material: true },
    });
  }

  // Método original de exclusão - atualizado para deletar arquivos
  async delete(id: string, professorId: string) {
    const conteudo = await this.prismaservice.conteudo.findUnique({
      where: { id },
    });

    if (!conteudo) {
      throw new Error('Conteúdo não encontrado');
    }

    if (conteudo.professorId !== professorId) {
      throw new Error('Você não tem permissão para deletar este conteúdo');
    }

    // Se for PDF, deletar arquivo do sistema
    if (conteudo.tipo === 'PDF' && conteudo.caminhoArquivo) {
      try {
        await fs.unlink(conteudo.caminhoArquivo);
      } catch (error) {
        console.warn('Arquivo PDF não pôde ser deletado:', error.message);
      }
    }

    await this.prismaservice.conteudo.delete({
      where: { id },
    });

    return { message: 'conteúdo excluido' };
  }
}