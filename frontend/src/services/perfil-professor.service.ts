import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Responsável por fornecer o token JWT

@Injectable({
  providedIn: 'root'
})
export class PerfilProfessorService {
  private apiUrl = 'http://localhost:3000/professores'; // Atualize o URL conforme necessário

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado.');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  atualizarPerfil(id: string, dados: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, dados, {
      headers: this.getAuthHeaders()
    });
  }

  atualizarSenha(id: string, dados: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/password`, dados, {
      headers: this.getAuthHeaders()
    });
  }

  getProfessorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
