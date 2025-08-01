import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './Prisma/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AlunoModule } from './users/aluno/aluno.module';
import { ProfessorModule } from './users/professor/professor.module';
import { ResponsavelModule } from './users/responsavel/responsavel.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AlunoModule,
    ProfessorModule,
    ResponsavelModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
