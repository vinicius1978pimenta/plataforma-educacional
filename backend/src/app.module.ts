import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './Prisma/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { VocabularioModule } from './vocabulario/vocabulario.module';
import { ProfessorModule } from './users/professor/professor.module';
import { AlunoModule } from './users/aluno/aluno.module';
import { ResponsavelModule } from './users/responsavel/responsavel.module';
import { HttpModule } from '@nestjs/axios';
import { TranslationModule } from './traducao/translation/translation.module';


@Module({
  imports: [PrismaModule,
            AuthModule,
            VocabularioModule,
            ProfessorModule,
            AlunoModule,
            ResponsavelModule
            ,HttpModule,
            TranslationModule
          ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}