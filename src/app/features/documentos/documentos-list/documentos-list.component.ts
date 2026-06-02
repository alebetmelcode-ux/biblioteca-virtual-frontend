import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DocumentoService } from '../../../core/services/documento.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { Documento, CreateDocumentoRequest, UpdateDocumentoRequest, DocumentoForm } from '../../../core/models/documento';
import { Categoria } from '../../../core/models/categoria';
import { PdfViewerComponent } from '../../../shared/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-documentos-list',
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
    SelectModule,
    FileUploadModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    PdfViewerComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './documentos-list.component.html',
  styleUrl: './documentos-list.component.css'
})
export class DocumentosListComponent implements OnInit {
  private documentoService = inject(DocumentoService);
  private categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  @ViewChild(PdfViewerComponent) pdfViewer!: PdfViewerComponent;

  documentos = signal<Documento[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  editandoId = signal<number | null>(null);
  archivoSeleccionado = signal<File | null>(null);
  busqueda = signal('');
  isAdmin = this.authService.isAdmin();

  form = new FormGroup<DocumentoForm>({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    }),
    autor: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)]
    }),
    idCategoria: new FormControl<number | null>(null, {
      validators: [Validators.required]
    })
  });

  get esNuevo() { return this.editandoId() === null; }
  get titulo() { return this.form.controls.titulo; }
  get autor() { return this.form.controls.autor; }
  get idCategoria() { return this.form.controls.idCategoria; }

  get documentosFiltrados(): Documento[] {
    const texto = this.busqueda().toLowerCase();
    if (!texto) return this.documentos();
    return this.documentos().filter(d =>
      d.titulo.toLowerCase().includes(texto) ||
      d.nombreCategoria.toLowerCase().includes(texto) ||
      (d.autor ?? '').toLowerCase().includes(texto)
    );
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.categoriaService.getAll().subscribe({
      next: (cats) => this.categorias.set(cats)
    });

    const obs = this.isAdmin
      ? this.documentoService.getAllIncludeInactivos()
      : this.documentoService.getAll();

    obs.subscribe({
      next: (docs) => {
        this.documentos.set(docs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.reset();
    this.archivoSeleccionado.set(null);
    this.dialogVisible.set(true);
  }

  abrirEditar(doc: Documento): void {
    this.editandoId.set(doc.id);
    this.form.patchValue({
      titulo: doc.titulo,
      autor: doc.autor ?? '',
      idCategoria: doc.idCategoria
    });
    this.archivoSeleccionado.set(null);
    this.dialogVisible.set(true);
  }

  verDocumento(doc: Documento): void {
    this.pdfViewer.abrir(doc.titulo, doc.rutaArchivo);
  }

  onArchivoSeleccionado(event: any): void {
    const file = event.files[0];
    if (file) this.archivoSeleccionado.set(file);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.editandoId();

    if (this.esNuevo) {
      if (!this.archivoSeleccionado()) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar un archivo PDF.' });
        return;
      }
      this.loading.set(true);
      const request: CreateDocumentoRequest = {
        titulo: this.titulo.value,
        autor: this.autor.value || undefined,
        idCategoria: this.idCategoria.value!
      };
      this.documentoService.create(request, this.archivoSeleccionado()!).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento creado correctamente.' });
          this.dialogVisible.set(false);
          this.cargarDatos();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(true);
      const request: UpdateDocumentoRequest = {
        id: id!,
        titulo: this.titulo.value,
        autor: this.autor.value || undefined,
        idCategoria: this.idCategoria.value!
      };
      this.documentoService.update(id!, request, this.archivoSeleccionado() ?? undefined).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento actualizado correctamente.' });
          this.dialogVisible.set(false);
          this.cargarDatos();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  confirmarEliminar(doc: Documento): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de desactivar el documento "${doc.titulo}"?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.documentoService.delete(doc.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento desactivado correctamente.' });
            this.cargarDatos();
          }
        });
      }
    });
  }

  confirmarActivar(doc: Documento): void {
    this.confirmationService.confirm({
      message: `¿Desea activar el documento "${doc.titulo}"?`,
      header: 'Confirmar activación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Activar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.documentoService.activar(doc.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento activado correctamente.' });
            this.cargarDatos();
          }
        });
      }
    });
  }
}