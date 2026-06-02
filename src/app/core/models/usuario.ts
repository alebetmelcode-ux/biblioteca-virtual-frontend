import { FormControl } from '@angular/forms';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  estado: boolean;
  fechaCreacion: string;
  roles: string[];
}

export interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rolesIds: number[];
}

export interface UpdateUsuarioRequest {
  id: number;
  nombre: string;
  email: string;
}

export interface CreateUsuarioForm {
  nombre: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  rolesIds: FormControl<number[]>;
}

export interface UpdateUsuarioForm {
  nombre: FormControl<string>;
  email: FormControl<string>;
}

export interface PasswordForm {
  passwordActual: FormControl<string>;
  passwordNuevo: FormControl<string>;
}