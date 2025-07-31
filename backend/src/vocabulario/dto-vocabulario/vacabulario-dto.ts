import { IsNotEmpty, isNotEmpty, IsString } from "class-validator";


export class VocabularioDto{
  @IsString()
  @IsNotEmpty()
  palavra : string;

  @IsString()
  traducao : string; 

}