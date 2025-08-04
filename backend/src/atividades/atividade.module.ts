import { Module } from '@nestjs/common';
import { AtividadesService } from './atividade.service';
import { AtividadesController } from './atividade.controller';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';
import { TranslationModule } from 'src/traducao/translation/translation.module';


@Module({
  imports: [PrismaModule,TranslationModule],
  providers: [AtividadesService],
  controllers: [AtividadesController],
  exports: [AtividadesService],
})
export class AtividadeModule {}
