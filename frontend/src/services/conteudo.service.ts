import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConteudoCreate } from './interfaces/conteudo-create.model';

@Injectable({
  providedIn: 'root'
})
export class ConteudoService {

  private apiurl = 'http://localhost:3000/conteudo';

  constructor(private http: HttpClient) {}

  // 🔑 Pega o token salvo no localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  criarconteudo(dto: ConteudoCreate): Observable<any> {
    return this.http.post(this.apiurl, dto, { headers: this.getAuthHeaders() });
  }

  listarconteudo(): Observable<any[]> {
    return this.http.get<any[]>(this.apiurl, { headers: this.getAuthHeaders() });
  }

  deletarconteudo(id: string): Observable<any> {
    return this.http.delete(`${this.apiurl}/${id}`, { headers: this.getAuthHeaders() });
  }

  atualizarconteudo(id: string, dto: ConteudoCreate): Observable<any> {
    return this.http.put(`${this.apiurl}/${id}`, dto, { headers: this.getAuthHeaders() });
  }
}
