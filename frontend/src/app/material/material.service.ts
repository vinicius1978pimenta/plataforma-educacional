import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateMaterialDto {
  titulo: string;
  conteudo: string;
  traducao: string;
}

export interface UpdateMaterialDto {
  titulo?: string;
  conteudo?: string;
  traducao?: string;
}

export interface FiltroMaterialDto {
  titulo?: string;
  traducao?: string;
}

export interface Material {
  conteudo: string;
  id: string;
  titulo: string;
  traducao: string;
  professorId: string;
  createdAt: string;
  updatedAt: string;
  atividades?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
 
  private apiUrl = 'http://localhost:3000/material';

  constructor(private http: HttpClient) { }

  // Função auxiliar para obter o token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  findAll(filtros?: FiltroMaterialDto): Observable<Material[]> {
    const headers = this.getAuthHeaders();
    let params: any = {};
    if (filtros?.titulo) params.titulo = filtros.titulo;
    if (filtros?.traducao) params.traducao = filtros.traducao;

    return this.http.get<Material[]>(this.apiUrl, { headers, params });
  }

  findOne(id: string): Observable<Material> {
    const headers = this.getAuthHeaders();
    return this.http.get<Material>(`${this.apiUrl}/${id}`, { headers });
  }

  create(createMaterialDto: CreateMaterialDto): Observable<Material> {
    const headers = this.getAuthHeaders();
    return this.http.post<Material>(this.apiUrl, createMaterialDto, { headers });
  }

  update(id: string, updateMaterialDto: UpdateMaterialDto): Observable<Material> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Material>(`${this.apiUrl}/${id}`, updateMaterialDto, { headers });
  }

  remove(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
