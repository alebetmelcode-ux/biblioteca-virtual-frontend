import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '../models/categoria';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Categorias`;

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  getAllIncludeInactivos(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.url}/todos`);
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }

  create(request: CreateCategoriaRequest): Observable<number> {
    return this.http.post<number>(this.url, request);
  }

  update(id: number, request: UpdateCategoriaRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/activar`, {});
  }
}