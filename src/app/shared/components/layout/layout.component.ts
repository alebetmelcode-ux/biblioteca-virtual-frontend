import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, DrawerModule, ButtonModule, AvatarModule, TooltipModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  drawerVisible = signal(false);
  isAdmin = this.authService.isAdmin();
  userName = this.authService.getUserName();
  currentRoute = signal('');
  menuItems: MenuItem[] = [];

  constructor() {
    this.menuItems = this.buildMenu();
    this.currentRoute.set(this.router.url);
    this.router.events.subscribe(() => {
      this.currentRoute.set(this.router.url);
    });
  }

  private buildMenu(): MenuItem[] {
    const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
      { label: 'Documentos', icon: 'pi pi-file-pdf', route: '/documentos' }
    ];

    if (this.isAdmin) {
      items.push(
        { label: 'Categorías', icon: 'pi pi-tags', route: '/categorias' },
        { label: 'Usuarios', icon: 'pi pi-users', route: '/usuarios' },
        { label: 'Roles', icon: 'pi pi-shield', route: '/roles' }
      );
    }

    return items;
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.drawerVisible.set(false);
  }

  confirmarLogout(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea cerrar sesión?',
      header: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Sí, cerrar sesión',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.authService.logout()
    });
  }
}