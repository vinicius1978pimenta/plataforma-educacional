import { Module } from '@nestjs/common';
import { ConteudoController } from './conteudo.controller';
import { ConteudoService } from './conteudo.service';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  controllers: [ConteudoController],
  providers: [ConteudoService],
  imports:[PrismaModule]
})
export class ConteudoModule {}
