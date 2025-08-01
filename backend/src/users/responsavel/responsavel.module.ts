import { Module } from '@nestjs/common';
import { ResponsavelController } from './responsavel.controller';
import { ResponsavelService } from './responsavel.service';

@Module({
  controllers: [ResponsavelController],
  providers: [ResponsavelService],
})
export class ResponsavelModule {}
