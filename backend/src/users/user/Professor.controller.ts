import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateTeacherDto } from '../dtos/professor.dto';

@Controller('professores')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createProfessor(@Body() dto: CreateTeacherDto) {
    return this.userService.create(dto);
  }
}
