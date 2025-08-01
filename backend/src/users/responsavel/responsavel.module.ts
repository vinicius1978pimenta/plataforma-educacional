import { Module } from '@nestjs/common';
import { ResponsavelController } from './responsavel.controller';
import { ResponsavelService } from './responsavel.service';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  controllers: [ResponsavelController],
  providers: [ResponsavelService],
  imports:[PrismaModule]
})
export class ResponsavelModule {}
