import { IsString } from 'class-validator';

export class UpdateResponsavelPasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
