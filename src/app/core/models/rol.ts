import { FormControl } from '@angular/forms';

export interface Rol {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface CreateRolRequest {
  nombre: string;
}

export interface UpdateRolRequest {
  nombre: string;
}

export interface RolForm {
  nombre: FormControl<string>;
}