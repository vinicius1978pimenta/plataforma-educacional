import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialController],
  providers: [MaterialService]
})
export class MaterialModule {}
