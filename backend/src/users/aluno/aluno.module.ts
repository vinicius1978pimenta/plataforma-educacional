import { Module } from '@nestjs/common';
import { AlunoController } from './aluno.controller';
import { AlunoService } from './aluno.service';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlunoController],
  providers: [AlunoService],
})
export class AlunoModule {}
