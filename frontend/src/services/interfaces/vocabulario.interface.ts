export interface Vocabulario {
  id: string;
  palavra: string;
  traducao: string;
  criadoEm: string;
}

export interface VocabularioDto {
  palavra: string;
  traducao?: string;
  idioma?: string;
}