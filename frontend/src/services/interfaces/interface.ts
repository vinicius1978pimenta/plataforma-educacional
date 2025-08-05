export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL';
  responsavelId?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL';
  responsavelEmail?: string;
}

export interface LoginData {
  email: string;
  password: string;
}