import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'GERAL' | 'URGENTE' | 'EVENTO' | 'LEMBRETE' | 'COMUNICADO';
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'CRITICA';
  ativo: boolean;
  dataInicio: string;
  dataExpiracao?: string;
  createdAt: string;
  updatedAt: string;
  professor: {
    id: string;
    name: string;
    email: string;
  };
  turmas: {
    id: string;
    nome: string;
  }[];
}

export interface CreateAvisoDto {
  titulo: string;
  conteudo: string;
  tipo?: 'GERAL' | 'URGENTE' | 'EVENTO' | 'LEMBRETE' | 'COMUNICADO';
  prioridade?: 'BAIXA' | 'NORMAL' | 'ALTA' | 'CRITICA';
  ativo?: boolean;
  turmaIds?: string[];
  dataExpiracao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvisosService {
  private apiUrl = 'http://localhost:3000/avisos';
   public avisosAluno: Aviso[] = [];

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    console.log('Token encontrado no AvisosService:', token); // Debug
    
    if (!token) {
      console.error('Token não encontrado no localStorage');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createAviso(aviso: CreateAvisoDto): Observable<Aviso> {
    return this.http.post<Aviso>(this.apiUrl, aviso, { headers: this.getHeaders() });
  }

  getAllAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getMeusAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/professor/meus`, { headers: this.getHeaders() });
  }

 getAvisosAluno(): Observable<Aviso[]> {
    
    if (this.avisosAluno.length > 0) {
      return of(this.avisosAluno); 
    }

  
    return this.http.get<Aviso[]>(`${this.apiUrl}/aluno/meus`, { headers: this.getHeaders() }).pipe(
      tap(avisosDaApi => {
        console.log('Buscando avisos da API e guardando na gaveta do serviço...');
        this.avisosAluno = avisosDaApi;
      })
    );
  }

  getAvisoById(id: string): Observable<Aviso> {
    return this.http.get<Aviso>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateAviso(id: string, aviso: Partial<CreateAvisoDto>): Observable<Aviso> {
    return this.http.patch<Aviso>(`${this.apiUrl}/${id}`, aviso, { headers: this.getHeaders() });
  }

  toggleAtivoAviso(id: string): Observable<Aviso> {
    return this.http.patch<Aviso>(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  deleteAviso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

    getAvisosResponsavel(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/responsavel/meus`, { headers: this.getHeaders() });
  }

}
