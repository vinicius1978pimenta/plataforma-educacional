import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

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
} )
export class AvisosService {
  private apiUrl = 'http://localhost:3000/avisos';

  constructor(private http: HttpClient ) {}


  createAviso(aviso: CreateAvisoDto): Observable<Aviso> {
    return this.http.post<Aviso>(this.apiUrl, aviso );
  }

  getAllAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.apiUrl );
  }

  getMeusAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/professor/meus` );
  }

  getAvisosAluno(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/aluno/meus` );
  }

  getAvisoById(id: string): Observable<Aviso> {
    return this.http.get<Aviso>(`${this.apiUrl}/${id}` );
  }

  updateAviso(id: string, aviso: Partial<CreateAvisoDto>): Observable<Aviso> {
    return this.http.patch<Aviso>(`${this.apiUrl}/${id}`, aviso );
  }

  toggleAtivoAviso(id: string): Observable<Aviso> {
    return this.http.patch<Aviso>(`${this.apiUrl}/${id}/toggle`, {} );
  }

  deleteAviso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}` );
  }

  getAvisosResponsavel(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/responsavel/meus` );
  }

  getAvisosAtivos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/ativos` ).pipe(
      catchError(this.handleError<Aviso[]>('getAvisosAtivos', []))
    );
  }

  getAvisosPorPeriodo(dataInicio: string, dataFim: string): Observable<Aviso[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    return this.http.get<Aviso[]>(`${this.apiUrl}/periodo`, { params: params } )
      .pipe(
        catchError(this.handleError<Aviso[]>('getAvisosPorPeriodo', []))
      );
  }

  getAvisosPorData(data: string): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiUrl}/data/${data}` ).pipe(
      catchError(this.handleError<Aviso[]>('getAvisosPorData', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
