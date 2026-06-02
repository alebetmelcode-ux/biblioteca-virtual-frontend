import { Component, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';
import { DocumentoService } from '../../../core/services/documento.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Documento } from '../../../core/models/documento';
import { Categoria } from '../../../core/models/categoria';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private documentoService = inject(DocumentoService);
  private categoriaService = inject(CategoriaService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isAdmin = this.authService.isAdmin();
  userName = this.authService.getUserName();

  totalDocumentos = signal(0);
  totalCategorias = signal(0);
  totalUsuarios = signal(0);
  ultimosDocumentos = signal<Documento[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    this.documentoService.getAll().subscribe({
      next: (docs) => {
        this.totalDocumentos.set(docs.length);
        this.ultimosDocumentos.set(docs.slice(0, 5));
      }
    });

    this.categoriaService.getAll().subscribe({
      next: (cats) => this.totalCategorias.set(cats.length)
    });

    if (this.isAdmin) {
      this.usuarioService.getAll().subscribe({
        next: (users) => {
          this.totalUsuarios.set(users.length);
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  irADocumentos(): void {
    this.router.navigate(['/documentos']);
  }

  irACategorias(): void {
    this.router.navigate(['/categorias']);
  }

  irAUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }
}