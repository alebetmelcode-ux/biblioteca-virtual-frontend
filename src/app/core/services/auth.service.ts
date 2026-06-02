import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, TokenPayload } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'token';

  private readonly ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private readonly NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
  private readonly ID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, request).pipe(
      tap(response => localStorage.setItem(this.TOKEN_KEY, response.token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.getTokenPayload();
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  }

  getTokenPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1];
      return JSON.parse(atob(base64)) as TokenPayload;
    } catch {
      return null;
    }
  }

  getUserName(): string {
    return this.getTokenPayload()?.[this.NAME_CLAIM] ?? '';
  }

  getUserId(): string {
    return this.getTokenPayload()?.[this.ID_CLAIM] ?? '';
  }

  getRoles(): string[] {
    const role = this.getTokenPayload()?.[this.ROLE_CLAIM];
    if (!role) return [];
    return Array.isArray(role) ? role : [role];
  }

  isAdmin(): boolean {
    return this.getRoles().includes('Administrador');
  }
}