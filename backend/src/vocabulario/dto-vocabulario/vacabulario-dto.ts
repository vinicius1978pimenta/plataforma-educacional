import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class VocabularioDto {
  @IsString()
  @IsNotEmpty()
  palavra: string;

  @IsOptional()
  @IsString()
  traducao?: string;

  @IsOptional()
  @IsIn(['en', 'es'])
  idioma?: 'en' | 'es';
}
