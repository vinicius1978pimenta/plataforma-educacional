import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conteudo, ConteudoCreate, ConteudoLink } from './interfaces/conteudo-create.model';

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

  // Pega o token para FormData (sem Content-Type)
  private getAuthHeadersForFile(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Método original - criar conteúdo texto
  criarconteudo(dto: ConteudoCreate): Observable<Conteudo> {
    return this.http.post<Conteudo>(this.apiurl, dto, { headers: this.getAuthHeaders() });
  }

  // Novo método - upload PDF
  uploadPdf(arquivo: File, dados: { titulo: string; descricao: string; texto?: string; materialId: string }): Observable<Conteudo> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('titulo', dados.titulo);
    formData.append('descricao', dados.descricao);
    formData.append('materialId', dados.materialId);
    
    if (dados.texto) {
      formData.append('texto', dados.texto);
    }

    return this.http.post<Conteudo>(`${this.apiurl}/upload-pdf`, formData, { 
      headers: this.getAuthHeadersForFile() 
    });
  }

  // Novo método - criar link
  criarLink(dados: ConteudoLink): Observable<Conteudo> {
    return this.http.post<Conteudo>(`${this.apiurl}/link`, dados, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Método original - listar conteúdos
  listarconteudo(): Observable<Conteudo[]> {
    return this.http.get<Conteudo[]>(this.apiurl, { headers: this.getAuthHeaders() });
  }

  // Buscar por ID
  buscarPorId(id: string): Observable<Conteudo> {
    return this.http.get<Conteudo>(`${this.apiurl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Download PDF
  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiurl}/${id}/download`, {
      headers: this.getAuthHeadersForFile(),
      responseType: 'blob'
    });
  }

  // Atualizar conteúdo
  atualizar(id: string, dados: Partial<Conteudo>): Observable<Conteudo> {
    return this.http.put<Conteudo>(`${this.apiurl}/${id}`, dados, { headers: this.getAuthHeaders() });
  }

  // Deletar conteúdo
  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiurl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Função auxiliar para download
  baixarArquivo(blob: Blob, nomeArquivo: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}



