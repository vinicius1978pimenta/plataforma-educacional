export interface Conteudo {
expanded: any;
  id: string;
  titulo: string;
  descricao: string;
  texto: string;
  tipo?: 'TEXTO' | 'PDF' | 'LINK';
  url?: string;
  nomeArquivo?: string;
  tamanho?: number;
  materialId: string;
  professorId: string;
  material?: {
    id: string;
    nome: string;
  };
  professor?: {
    id: string;
    nome: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface ConteudoCreate {
  titulo: string;
  descricao: string;
  texto: string;
  materialId: string;
}

export interface ConteudoLink {
  titulo: string;
  descricao: string;
  texto?: string;
  url: string;
  materialId: string;
}
export interface ConteudoUpdate {
  titulo?: string;
  descricao?: string;
  texto?: string;
  url?: string; // só colocar se realmente for URL válida
}
