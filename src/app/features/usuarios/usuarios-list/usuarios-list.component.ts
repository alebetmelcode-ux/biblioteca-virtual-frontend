import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest, CreateUsuarioForm, PasswordForm, UpdateUsuarioForm } from '../../../core/models/usuario';
import { Rol } from '../../../core/models/rol';


@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    TagModule,
    ConfirmDialogModule,
    TooltipModule,
    MultiSelectModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  usuarios = signal<Usuario[]>([]);
  roles = signal<Rol[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  passwordDialogVisible = signal(false);
  rolesDialogVisible = signal(false);
  editandoId = signal<number | null>(null);
  usuarioSeleccionado = signal<Usuario | null>(null);
  busqueda = signal('');

  createForm = new FormGroup<CreateUsuarioForm>({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(120)]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)]
    }),
    rolesIds: new FormControl<number[]>([], {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  updateForm = new FormGroup<UpdateUsuarioForm>({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(120)]
    })
  });

  passwordForm = new FormGroup<PasswordForm>({
    passwordActual: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    passwordNuevo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)]
    })
  });

  rolesControl = new FormControl<number[]>([], { nonNullable: true });

  get esNuevo() { return this.editandoId() === null; }

  get usuariosFiltrados(): Usuario[] {
    const texto = this.busqueda().toLowerCase();
    if (!texto) return this.usuarios();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(texto) ||
      u.email.toLowerCase().includes(texto)
    );
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
  this.loading.set(true);
  this.rolService.getAll().subscribe({
    next: (roles) => this.roles.set(roles)
  });
  this.usuarioService.getAllIncludeInactivos().subscribe({
    next: (usuarios) => {
      this.usuarios.set(usuarios);
      this.loading.set(false);
    },
    error: () => this.loading.set(false)
  });
}

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.createForm.reset();
    this.dialogVisible.set(true);
  }

  abrirEditar(usuario: Usuario): void {
    this.editandoId.set(usuario.id);
    this.updateForm.patchValue({
      nombre: usuario.nombre,
      email: usuario.email
    });
    this.dialogVisible.set(true);
  }

  abrirPassword(usuario: Usuario): void {
    this.usuarioSeleccionado.set(usuario);
    this.passwordForm.reset();
    this.passwordDialogVisible.set(true);
  }

  abrirRoles(usuario: Usuario): void {
    this.usuarioSeleccionado.set(usuario);
    const idsActuales = this.roles()
      .filter(r => usuario.roles.includes(r.nombre))
      .map(r => r.id);
    this.rolesControl.setValue(idsActuales);
    this.rolesDialogVisible.set(true);
  }

  guardar(): void {
    if (this.esNuevo) {
      if (this.createForm.invalid) {
        this.createForm.markAllAsTouched();
        return;
      }
      this.loading.set(true);
      const request: CreateUsuarioRequest = this.createForm.getRawValue();
      this.usuarioService.create(request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente.' });
          this.dialogVisible.set(false);
          this.cargarDatos();
        },
        error: () => this.loading.set(false)
      });
    } else {
      if (this.updateForm.invalid) {
        this.updateForm.markAllAsTouched();
        return;
      }
      this.loading.set(true);
      const id = this.editandoId()!;
      const request: UpdateUsuarioRequest = { id, ...this.updateForm.getRawValue() };
      this.usuarioService.update(id, request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente.' });
          this.dialogVisible.set(false);
          this.cargarDatos();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  guardarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const usuario = this.usuarioSeleccionado()!;
    const { passwordActual, passwordNuevo } = this.passwordForm.getRawValue();
    this.usuarioService.cambiarPassword(usuario.id, passwordActual, passwordNuevo).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente.' });
        this.passwordDialogVisible.set(false);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  guardarRoles(): void {
    const usuario = this.usuarioSeleccionado()!;
    const rolesActuales = this.roles()
      .filter(r => usuario.roles.includes(r.nombre))
      .map(r => r.id);
    const rolesNuevos = this.rolesControl.value;

    const asignar = rolesNuevos.filter(id => !rolesActuales.includes(id));
    const revocar = rolesActuales.filter(id => !rolesNuevos.includes(id));

    this.loading.set(true);

    const operaciones = [
      ...asignar.map(idRol => this.usuarioService.asignarRol(usuario.id, idRol)),
      ...revocar.map(idRol => this.usuarioService.revocarRol(usuario.id, idRol))
    ];

    if (operaciones.length === 0) {
      this.rolesDialogVisible.set(false);
      this.loading.set(false);
      return;
    }

    let completados = 0;
    operaciones.forEach(obs => {
      obs.subscribe({
        next: () => {
          completados++;
          if (completados === operaciones.length) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Roles actualizados correctamente.' });
            this.rolesDialogVisible.set(false);
            this.cargarDatos();
          }
        },
        error: () => this.loading.set(false)
      });
    });
  }

  confirmarEliminar(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de desactivar al usuario "${usuario.nombre}"?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuarioService.delete(usuario.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario desactivado correctamente.' });
            this.cargarDatos();
          }
        });
      }
    });
  }

  confirmarActivar(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Desea activar al usuario "${usuario.nombre}"?`,
      header: 'Confirmar activación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Activar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.usuarioService.activar(usuario.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario activado correctamente.' });
            this.cargarDatos();
          }
        });
      }
    });
  }
}