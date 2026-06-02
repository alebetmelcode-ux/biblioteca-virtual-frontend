import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol, CreateRolRequest, UpdateRolRequest } from '../models/rol';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Roles`;

  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.url);
  }

  getAllIncludeInactivos(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.url}/todos`);
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.url}/${id}`);
  }

  create(request: CreateRolRequest): Observable<number> {
    return this.http.post<number>(this.url, request);
  }

  update(id: number, request: UpdateRolRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/activar`, {});
  }
}