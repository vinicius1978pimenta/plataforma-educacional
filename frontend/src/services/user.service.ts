import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
} )
export class UserService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient ) { }

  private getApiUrl(userRole: string): string {
    switch (userRole) {
      case 'PROFESSOR':
        return `${this.baseUrl}/professores`;
      case 'ALUNO':
        return `${this.baseUrl}/alunos`;
      case 'RESPONSAVEL':
        return `${this.baseUrl}/responsaveis`;
      default:
        throw new Error(`Role de usuário desconhecida ou não mapeada: ${userRole}`);
    }
  }

  getUserById(userId: string, userRole: string): Observable<any> {
    const apiUrl = this.getApiUrl(userRole);
    return this.http.get<any>(`${apiUrl}/${userId}` );
  }

  updateUser(userId: string, userRole: string, userData: any): Observable<any> {
    const apiUrl = this.getApiUrl(userRole);
    return this.http.patch<any>(`${apiUrl}/${userId}`, userData );
  }

  updatePassword(userId: string, userRole: string, passwordData: any): Observable<any> {
    const apiUrl = this.getApiUrl(userRole);
    return this.http.patch<any>(`${apiUrl}/${userId}/password`, passwordData );
  }

  getFilhosByResponsavelId(responsavelId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/responsaveis/${responsavelId}/filhos`);
  }

    getAlunosForProfessor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/professores/alunos`);
  }
}