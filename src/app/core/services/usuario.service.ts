import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../models/usuario';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Usuarios`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  getAllIncludeInactivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/todos`);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  create(request: CreateUsuarioRequest): Observable<number> {
    return this.http.post<number>(this.url, request);
  }

  update(id: number, request: UpdateUsuarioRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/activar`, {});
  }

  asignarRol(idUsuario: number, idRol: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${idUsuario}/roles`, { idRol });
  }

  revocarRol(idUsuario: number, idRol: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idUsuario}/roles/${idRol}`);
  }

  cambiarPassword(idUsuario: number, passwordActual: string, passwordNuevo: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${idUsuario}/password`, { idUsuario, passwordActual, passwordNuevo });
  }
}