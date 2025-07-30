import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './Prisma/prisma/prisma.module';
import { UserModule } from './users/user/Professor.module';


@Module({
  imports: [PrismaModule,UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
