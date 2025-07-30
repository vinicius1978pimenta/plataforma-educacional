import { Module } from '@nestjs/common';
import { UserController } from './Professor.controller';
import { UserService } from './Professor.service';
import { PrismaModule } from 'src/Prisma/prisma/prisma.module';

@Module({
  imports : [PrismaModule ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
