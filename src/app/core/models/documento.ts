import { FormControl } from '@angular/forms';

export interface Documento {
  id: number;
  titulo: string;
  autor?: string;
  rutaArchivo: string;
  idCategoria: number;
  nombreCategoria: string;
  idUsuario: number;
  fechaSubida: string;
  estado: boolean;
}

export interface CreateDocumentoRequest {
  titulo: string;
  autor?: string;
  idCategoria: number;
}

export interface UpdateDocumentoRequest {
  id: number;
  titulo: string;
  autor?: string;
  idCategoria: number;
}

export interface DocumentoForm {
  titulo: FormControl<string>;
  autor: FormControl<string>;
  idCategoria: FormControl<number | null>;
}