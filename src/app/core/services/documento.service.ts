import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Documento, CreateDocumentoRequest, UpdateDocumentoRequest } from '../models/documento';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Documentos`;

  getAll(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.url);
  }

  getAllIncludeInactivos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.url}/todos`);
  }

  getById(id: number): Observable<Documento> {
    return this.http.get<Documento>(`${this.url}/${id}`);
  }

  getByCategoria(idCategoria: number): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.url}/categoria/${idCategoria}`);
  }

  create(request: CreateDocumentoRequest, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('request.Titulo', request.titulo);
    if (request.autor) formData.append('request.Autor', request.autor);
    formData.append('request.IdCategoria', request.idCategoria.toString());
    formData.append('archivoPdf', archivo);
    return this.http.post(this.url, formData);
  }

  update(id: number, request: UpdateDocumentoRequest, archivo?: File): Observable<void> {
    const formData = new FormData();
    formData.append('request.Titulo', request.titulo);
    if (request.autor) formData.append('request.Autor', request.autor);
    formData.append('request.IdCategoria', request.idCategoria.toString());
    if (archivo) formData.append('archivoPdf', archivo);
    return this.http.put<void>(`${this.url}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/activar`, {});
  }
}