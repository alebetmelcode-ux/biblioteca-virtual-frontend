import { FormControl } from '@angular/forms';

export interface Categoria {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface CreateCategoriaRequest {
  nombre: string;
}

export interface UpdateCategoriaRequest {
  nombre: string;
}

export interface CategoriaForm {
  nombre: FormControl<string>;
}