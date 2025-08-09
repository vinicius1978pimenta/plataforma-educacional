// src/services/vocabulario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Vocabulario, VocabularioDto } from '../services/interfaces/vocabulario.interface';

@Injectable({
  providedIn: 'root'
})
export class VocabularioService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/vocabulario';
  
  private vocabulariosSubject = new BehaviorSubject<Vocabulario[]>([]);
  public vocabularios$ = this.vocabulariosSubject.asObservable();

  private getHeaders(): HttpHeaders {
    // Usar access_token que é a chave correta
    const token = localStorage.getItem('access_token');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Método para verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Método para lidar com erros de autenticação
  private handleAuthError(error: any): Observable<never> {
    if (error.status === 401) {
      console.warn('Token inválido ou expirado. Redirecionando para login...');
      // Aqui você pode redirecionar para a tela de login
      // this.router.navigate(['/login']);
      localStorage.removeItem('token');
    }
    return throwError(() => error);
  }

  carregarVocabularios(): Observable<Vocabulario[]> {
    const headers = this.getHeaders();
    
    return this.http.get<Vocabulario[]>(`${this.baseUrl}`, { headers }).pipe(
      tap(vocabularios => {
        console.log('Vocabulários carregados:', vocabularios?.length || 0);
        this.vocabulariosSubject.next(vocabularios || []);
      }),
      catchError(error => {
        console.error('Erro ao carregar vocabulários:', error);
        return this.handleAuthError(error);
      })
    );
  }

  adicionarVocabulario(dto: VocabularioDto): Observable<Vocabulario> {
    const headers = this.getHeaders();
    
    
    
    return this.http.post<Vocabulario>(`${this.baseUrl}`, dto, { headers }).pipe(
      tap(novoVocabulario => {
        
        
        if (novoVocabulario) {
          const vocabulariosAtuais = this.vocabulariosSubject.value;
          this.vocabulariosSubject.next([novoVocabulario, ...vocabulariosAtuais]);
        }
      }),
      catchError(error => {
        console.error('Erro ao adicionar vocabulário:', error);
        return this.handleAuthError(error);
      })
    );
  }

  excluirVocabulario(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/${id}`, { headers }).pipe(
      tap(() => {
        const vocabulariosAtuais = this.vocabulariosSubject.value;
        const vocabulariosFiltrados = vocabulariosAtuais.filter(v => v.id !== id);
        this.vocabulariosSubject.next(vocabulariosFiltrados);
      }),
      catchError(error => {
        console.error('Erro ao excluir vocabulário:', error);
        return this.handleAuthError(error);
      })
    );
  }
}