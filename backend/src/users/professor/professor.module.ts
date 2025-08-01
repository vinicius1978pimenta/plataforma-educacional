import { Module } from '@nestjs/common';
import { ProfessorService } from './professor.service';
import { ProfessorController } from './professor.controller';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  controllers: [ProfessorController],
  providers: [ProfessorService],
  imports:[PrismaModule]
})
export class ProfessorModule {}
