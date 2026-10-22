import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient);

  /** Estado de la conexión con el API; se reemplaza cuando existan las pantallas reales. */
  protected readonly conexion = signal('Comprobando conexión con el servidor…');

  constructor() {
    this.http.get<{ estado: string }>('/api/health').subscribe({
      next: () => this.conexion.set('Servidor y base de datos conectados'),
      error: () => this.conexion.set('No se pudo conectar con el servidor'),
    });
  }
}
