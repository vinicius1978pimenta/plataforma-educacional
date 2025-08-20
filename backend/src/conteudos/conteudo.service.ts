import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma/prisma.service';
import { ConteudoDTO } from './dto/conteudo-dto';
import { ConteudoUpdateDto } from './dto/conteudo-update-dto';

@Injectable()
export class ConteudoService {
  
 
  constructor(private readonly prismaservice : PrismaService){}

  //criar conteudo
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

  // Cria o conteúdo
  return await this.prismaservice.conteudo.create({
    data: {
      titulo: dto.titulo,
      descricao: dto.descricao,
      texto: dto.texto,
      materialId: dto.materialId,
      professorId: professorId,
    },
  });
}

  //achar todos os conteudos
 // Conteúdos que o professor criou
  async findAllByProfessor(professorId: string) {
  return await this.prismaservice.conteudo.findMany({
    where: { professorId },
    include: { material: true },
  });
}

  // Conteúdos que o aluno pode acessar
  async findAllByAluno(alunoId: string) {
  return await this.prismaservice.conteudo.findMany({
    where: {
      alunos: {
        some: { id: alunoId },
      },
    },
    include: { material: true, professor: true },
  });
}


  //att conteudo 
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

  // Atualiza o conteúdo
  return await this.prismaservice.conteudo.update({
    where: { id },
    data: {
      ...dto,
      professorId, 
    },
  });
}


  async delete(id: string, professorId: string) {
  // opcional: verifica se o conteúdo pertence ao professor antes de deletar
  const conteudo = await this.prismaservice.conteudo.findUnique({
    where: { id },
  });

  if (!conteudo) {
    throw new Error('Conteúdo não encontrado');
  }

  if (conteudo.professorId !== professorId) {
    throw new Error('Você não tem permissão para deletar este conteúdo');
  }

  await this.prismaservice.conteudo.delete({
    where: { id },
  });
  
  return {message : 'conteúdo excluido'}
}

}
