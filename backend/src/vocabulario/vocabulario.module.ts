import { Module } from '@nestjs/common';
import { VocabularioService } from './vocabulario.service';
import { VocabularioController } from '../vocabulario/vocabulario.controller';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';
import { TranslationModule } from 'src/traducao/translation/translation.module';

@Module({
  imports : [PrismaModule,TranslationModule],
  providers: [VocabularioService],
  controllers: [VocabularioController],
})
export class VocabularioModule {}
