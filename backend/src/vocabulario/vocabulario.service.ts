import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { VocabularioDto } from './dto-vocabulario/vacabulario-dto';
import { TranslationService } from 'src/traducao/translation/translation.service';

@Injectable()
export class VocabularioService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  async create(dto: VocabularioDto, alunoId: string) {
    const idioma = dto.idioma || 'es'; // padrão espanhol
    
    let traducao: string;
    
    if (dto.traducao && dto.traducao.trim() !== '') {
      
      traducao = dto.traducao.trim();
    } else {
      
      try {
        console.log('Chamando tradução para:', dto.palavra, 'idioma:', idioma);
        traducao = await this.translationService.translate(dto.palavra, idioma);
        console.log('Tradução recebida:', traducao);
        
      } catch (error) {
        console.error('Erro ao traduzir:', error.message);
        // Em caso de erro na tradução, use a palavra original como fallback
        traducao = dto.palavra;
        console.log('Usando palavra original como fallback:', traducao);
      }
    }

    // Garantir que traducao nunca seja undefined/null/empty
    if (!traducao || typeof traducao !== 'string' || traducao.trim() === '') {
      console.warn('Tradução inválida, usando palavra original');
      traducao = dto.palavra;
    }

    // Log final para debug
    console.log('Dados que serão salvos:', {
      palavra: dto.palavra,
      traducao,
      alunoId,
    });

    return await this.prisma.vocabulo.create({
      data: {
        palavra: dto.palavra,
        traducao: traducao.trim(),
        alunoId,
      },
    });
  }

  findAllByAluno(alunoId: string) {
    return this.prisma.vocabulo.findMany({
      where: { alunoId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async delete(id: string, alunoId: string) {
    // Verifica se a palavra existe e pertence ao aluno
    const palavra = await this.prisma.vocabulo.findFirst({
      where: { id, alunoId },
    });

    if (!palavra) {
      throw new NotFoundException('Palavra não encontrada ou não pertence a você');
    }

    // Deleta a palavra
    await this.prisma.vocabulo.delete({
      where: { id },
    });

    return {
      message: 'Palavra excluída com sucesso!',
      palavra: {
        id: palavra.id,
        palavra: palavra.palavra,
        traducao: palavra.traducao,
      }
    };
  }
}