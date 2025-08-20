import { IsString } from "class-validator";

export class ConteudoDTO {
  @IsString()
  titulo: string;

  @IsString()
  descricao: string;

  @IsString()
  texto: string; 

  @IsString()
  materialId: string;
}
