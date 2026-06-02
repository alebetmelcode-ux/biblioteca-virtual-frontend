import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'documentos',
        loadComponent: () => import('./features/documentos/documentos-list/documentos-list.component').then(m => m.DocumentosListComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categorias/categorias-list/categorias-list.component').then(m => m.CategoriasListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/roles-list/roles-list.component').then(m => m.RolesListComponent),
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];