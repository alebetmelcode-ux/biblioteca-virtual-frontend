import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, ProgressSpinnerModule, SafePipe],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent {
  visible = signal(false);
  titulo = signal('');
  url = signal('');
  cargando = signal(true);

  abrir(titulo: string, rutaArchivo: string): void {
    this.titulo.set(titulo);
    this.url.set(`https://localhost:7284${rutaArchivo}`);
    this.cargando.set(true);
    this.visible.set(true);
  }

  cerrar(): void {
    this.visible.set(false);
    this.url.set('');
  }

  onCargado(): void {
    this.cargando.set(false);
  }

  descargar(): void {
    window.open(this.url(), '_blank');
  }
}