import { Module } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { AvisosController } from './avisos.controller';
import { PrismaModule } from '../Prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AvisosController],
  providers: [AvisosService],
  exports: [AvisosService],
})
export class AvisosModule {}
