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
import { RolService } from '../../../core/services/rol.service';
import { Rol, RolForm } from '../../../core/models/rol';

@Component({
  selector: 'app-roles-list',
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
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit {
  private rolService = inject(RolService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  roles = signal<Rol[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  editandoId = signal<number | null>(null);
  busqueda = signal('');

  form = new FormGroup<RolForm>({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)]
    })
  });

  get nombre() { return this.form.controls.nombre; }

  get rolesFiltrados(): Rol[] {
    const texto = this.busqueda().toLowerCase();
    if (!texto) return this.roles();
    return this.roles().filter(r =>
      r.nombre.toLowerCase().includes(texto)
    );
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading.set(true);
    this.rolService.getAllIncludeInactivos().subscribe({
      next: (roles) => {
        this.roles.set(roles);
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

  abrirEditar(rol: Rol): void {
    this.editandoId.set(rol.id);
    this.form.patchValue({ nombre: rol.nombre });
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
      this.rolService.update(id, this.form.getRawValue()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado correctamente.' });
          this.dialogVisible.set(false);
          this.cargarRoles();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.rolService.create(this.form.getRawValue()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente.' });
          this.dialogVisible.set(false);
          this.cargarRoles();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  confirmarEliminar(rol: Rol): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el rol "${rol.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rolService.delete(rol.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado correctamente.' });
            this.cargarRoles();
          }
        });
      }
    });
  }

  confirmarActivar(rol: Rol): void {
    this.confirmationService.confirm({
      message: `¿Desea reactivar el rol "${rol.nombre}"?`,
      header: 'Confirmar activación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Activar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.rolService.activar(rol.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol activado correctamente.' });
            this.cargarRoles();
          }
        });
      }
    });
  }
}