import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {
  private apiUrl = 'http://localhost:3000/atividades';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /** Reaproveita o header com token */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();

    if (!token) {
      throw new Error('Token de autenticação não encontrado.');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  criarAtividade(atividade: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, atividade, {
      headers: this.getAuthHeaders()
    });
  }

  getAtividadeById(id: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}`, {
    headers: this.getAuthHeaders()
  });
}

  getAtividades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  atualizarAtividade(id: string, atividade: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, atividade, {
      headers: this.getAuthHeaders()
    });
  }

  excluirAtividade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

findByMaterialId(materialId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}?materialId=${materialId}`, {
    headers: this.getAuthHeaders()
  });
}

}

