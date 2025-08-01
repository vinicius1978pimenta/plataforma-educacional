import { Module } from '@nestjs/common';
import { VocabularioService } from './vocabulario.service';
import { VocabularioController } from '../vocabulario/vocabulario.controller';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  imports : [PrismaModule],
  providers: [VocabularioService],
  controllers: [VocabularioController],
})
export class VocabularioModule {}
