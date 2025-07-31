import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './Prisma/prisma/prisma.module';
import { UserModule } from './users/professor/Professor.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { VocabularioModule } from './vocabulario/vocabulario.module';


@Module({
  imports: [PrismaModule,UserModule,AuthModule,VocabularioModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
