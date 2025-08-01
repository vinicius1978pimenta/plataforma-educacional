import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrarDto } from './dto/registrar.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/regras.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegistrarDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  //  rota protegida apenas para professores
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR)
  @Get('professor-only')
  professorOnlyRoute(@CurrentUser() user: any) {
    return { message: 'Esta rota é apenas para professores', user };
  }

  //  rota para professores e responsáveis
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSOR, Role.RESPONSAVEL)
  @Get('professor-responsavel')
  professorResponsavelRoute(@CurrentUser() user: any) {
    return { message: 'Esta rota é para professores e responsáveis', user };
  }
}
