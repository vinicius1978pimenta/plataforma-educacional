import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class TranslateAtividadeDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  @IsIn(['en', 'es'])
  targetLang?: string = 'en';
}
