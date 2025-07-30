import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../Prisma/prisma/prisma.service'; 
import { CreateTeacherDto } from '../dtos/professor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: CreateTeacherDto) {
    
    const hashPassword = await bcrypt.hash(dto.password, 10);

    const professor = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashPassword,
        role: 'PROFESSOR', 
      },
    });

    
    return {
      id: professor.id,
      name: professor.name,
      email: professor.email,
      role: professor.role,
    };
  }
}
