import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BarraEstadoPwa } from './core/pwa/barra-estado-pwa';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BarraEstadoPwa],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);

  protected readonly secciones = [
    { ruta: '/trailers', texto: 'Trailers' },
    { ruta: '/vender', texto: 'Vender' },
    { ruta: '/vales', texto: 'Vales' },
    { ruta: '/resumen', texto: 'Resumen' },
  ];
}
