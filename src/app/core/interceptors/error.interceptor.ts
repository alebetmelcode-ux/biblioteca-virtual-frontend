import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        authService.navigateToLogin();
        return throwError(() => error);
      }

      let mensaje = 'Ocurrió un error inesperado.';

      if (error.status === 400 && error.error?.errors) {
        const errores = Object.values(error.error.errors).flat().join(' ');
        mensaje = errores as string;
      } else if (error.status === 400) {
        mensaje = error.error?.detail ?? 'Solicitud inválida.';
      } else if (error.status === 403) {
        mensaje = 'No tiene permisos para realizar esta acción.';
      } else if (error.status === 404) {
        mensaje = error.error?.detail ?? 'Recurso no encontrado.';
      } else if (error.status === 500) {
        mensaje = 'Error interno del servidor. Contacte al administrador.';
      } else if (error.status === 0) {
        mensaje = 'No se pudo conectar con el servidor. Verifique su conexión.';
      }

      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: mensaje,
        life: 5000
      });

      return throwError(() => error);
    })
  );
};