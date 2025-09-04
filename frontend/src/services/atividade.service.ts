import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AtividadeService {
  private readonly apiRoot = 'http://localhost:3000';
  private readonly apiUrl  = `${this.apiRoot}/atividades`;
  private readonly materialUrl = `${this.apiRoot}/material`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ---------- CRUD professor ----------
  criarAtividade(atividade: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, atividade, { headers: this.getAuthHeaders() });
  }

  getAtividadeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(id)}`, { headers: this.getAuthHeaders() });
  }

  getAtividades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  atualizarAtividade(id: string, atividade: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${encodeURIComponent(id)}`, atividade, { headers: this.getAuthHeaders() });
  }

  excluirAtividade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`, { headers: this.getAuthHeaders() });
  }

  findByMaterialId(materialId: string): Observable<any[]> {
    const params = new HttpParams().set('materialId', materialId);
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders(), params });
  }

  // ---------- Respostas/avaliação ----------
  enviarResposta(body: { atividadeId: string; resposta: string; anexos?: string[] }) {
    return this.http.post(`${this.apiUrl}/respostas`, body, { headers: this.getAuthHeaders() });
  }

  getRespostas(atividadeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${encodeURIComponent(atividadeId)}/respostas`, {
      headers: this.getAuthHeaders()
    });
  }

  registrarAvaliacao(avaliacao: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/resposta/${encodeURIComponent(avaliacao.respostaId)}`, avaliacao, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------- Tradução ----------
  traduzirAtividade(text: string, targetLang: string): Observable<any> {
    const payload = { text, targetLang };
    return this.http.post<any>(`${this.apiUrl}/translate`, payload, { headers: this.getAuthHeaders() });
  }

  // ---------- Métricas simples ----------
  getQuantidadeAtividades(): Observable<number> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(atividades => atividades.length)
    );
  }

  getMateriais(): Observable<any[]> {
    return this.http.get<any[]>(this.materialUrl, { headers: this.getAuthHeaders() });
  }


  
  getAtividadesRelatorio(materialId?: string, alunoId?: string) {
    let params = new HttpParams();
    if (materialId) params = params.set('materialId', materialId);
    if (alunoId)    params = params.set('alunoId', alunoId);

    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  
  getMinhaRespostaRelatorio(atividadeId: string, alunoId?: string) {
    let params = new HttpParams();
    if (alunoId) params = params.set('alunoId', alunoId);

    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(atividadeId)}/minha-resposta`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  // Conveniências quando já tem o ID do filho em mãos
  getAtividadesRelatorioDeAluno(alunoId: string, materialId?: string) {
    return this.getAtividadesRelatorio(materialId, alunoId);
  }

  getRespostaDeAlunoRelatorio(alunoId: string, atividadeId: string) {
    return this.getMinhaRespostaRelatorio(atividadeId, alunoId);
  }

  // ---------- Contador de pendentes do aluno logado ----------
  getMinhaResposta(atividadeId: string) {
    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(atividadeId)}/minha-resposta`, {
      headers: this.getAuthHeaders()
    });
  }

  getPendentes() {
    return this.getAtividades().pipe(
      switchMap((atividades) => {
        if (!atividades?.length) return of(0);
        const chamadas = atividades.map(a =>
          this.getMinhaResposta(a.id).pipe(map((r: any) => (r?.status ? r.status : null)))
        );
        return forkJoin(chamadas).pipe(
          map(statuses => statuses.filter(st => st !== 'ENVIADA' && st !== 'CORRIGIDA').length)
        );
      })
    );
  }
}
