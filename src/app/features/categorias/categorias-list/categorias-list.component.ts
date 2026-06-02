import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria, CategoriaForm } from '../../../core/models/categoria';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule
  ],
  providers: [ConfirmationService],
  templateUrl: './categorias-list.component.html',
  styleUrl: './categorias-list.component.css'
})
export class CategoriasListComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  editandoId = signal<number | null>(null);
  busqueda = signal('');

  form = new FormGroup<CategoriaForm>({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)]
    })
  });

  get nombre() { return this.form.controls.nombre; }

  get categoriasFiltradas(): Categoria[] {
    const texto = this.busqueda().toLowerCase();
    if (!texto) return this.categorias();
    return this.categorias().filter(c =>
      c.nombre.toLowerCase().includes(texto)
    );
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading.set(true);
    this.categoriaService.getAllIncludeInactivos().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  abrirEditar(categoria: Categoria): void {
    this.editandoId.set(categoria.id);
    this.form.patchValue({ nombre: categoria.nombre });
    this.dialogVisible.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const id = this.editandoId();

    if (id) {
      this.categoriaService.update(id, this.form.getRawValue()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada correctamente.' });
          this.dialogVisible.set(false);
          this.cargarCategorias();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.categoriaService.create(this.form.getRawValue()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada correctamente.' });
          this.dialogVisible.set(false);
          this.cargarCategorias();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  confirmarEliminar(categoria: Categoria): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de desactivar la categoría "${categoria.nombre}"?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriaService.delete(categoria.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría desactivada correctamente.' });
            this.cargarCategorias();
          }
        });
      }
    });
  }

  confirmarActivar(categoria: Categoria): void {
    this.confirmationService.confirm({
      message: `¿Desea activar la categoría "${categoria.nombre}"?`,
      header: 'Confirmar activación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Activar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.categoriaService.activar(categoria.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría activada correctamente.' });
            this.cargarCategorias();
          }
        });
      }
    });
  }
}