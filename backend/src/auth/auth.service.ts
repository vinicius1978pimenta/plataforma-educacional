import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../Prisma/prisma/prisma.service';
import { RegistrarDto } from './dto/registrar.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegistrarDto) {
    const { name, email, password, role, responsavelEmail } = registerDto;

    // Verifica se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    let responsavelId: string | null = null;

    // Se for aluno, busca o responsável pelo email
    if (role === Role.ALUNO) {
      if (!responsavelEmail) {
        throw new BadRequestException(
          'Email do responsável é obrigatório para alunos',
        );
      }

      const responsavel = await this.prisma.user.findUnique({
        where: { email: responsavelEmail },
      });

      if (!responsavel) {
        throw new BadRequestException(
          'Responsável não encontrado com o email fornecido',
        );
      }

      if (responsavel.role !== Role.RESPONSAVEL) {
        throw new BadRequestException(
          'O usuário informado não é um responsável',
        );
      }

      responsavelId = responsavel.id; // 
    }

    // Gera hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        responsavelId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        responsavelId: true,
        createdAt: true,
      },
    });

    return {
      message: 'Usuário criado com sucesso',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Busca o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera os tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Token de acesso com duração menor
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Refresh token com duração maior
    });

    // Salva o refresh token no banco (hash para segurança)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        responsavelId: user.responsavelId,
      },
    };
  }

  // NOVOS MÉTODOS PARA REFRESH TOKEN
  async refreshToken(refreshToken: string) {
    try {
      // Verifica se o refresh token é válido
      const payload = this.jwtService.verify(refreshToken);

      // Busca o usuário
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Verifica se o refresh token corresponde ao salvo no banco
      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Gera novos tokens
      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      // Atualiza o refresh token no banco
      const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedNewRefreshToken },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async logout(userId: string) {
    // Validação para evitar erro de userId undefined
    if (!userId) {
      throw new UnauthorizedException('ID do usuário não fornecido');
    }

    // Remove o refresh token do banco
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return {
      message: 'Logout realizado com sucesso',
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        responsavelId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
