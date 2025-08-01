import { IsString } from 'class-validator';

export class UpdateProfessorPasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
