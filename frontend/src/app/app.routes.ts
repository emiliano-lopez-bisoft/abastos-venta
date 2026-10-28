import { Routes } from '@angular/router';
import { invitadoGuard, sesionGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./login/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivateChild: [sesionGuard],
    children: [
      {
        path: 'trailers',
        title: 'Trailers',
        loadComponent: () => import('./trailers/lista/trailers-page').then((m) => m.TrailersPage),
      },
      {
        path: 'trailers/nuevo',
        title: 'Registrar trailer',
        loadComponent: () =>
          import('./trailers/nuevo/nuevo-trailer-page').then((m) => m.NuevoTrailerPage),
      },
      {
        path: 'trailers/:id/liquidacion',
        title: 'Liquidación',
        loadComponent: () =>
          import('./resumen/liquidacion/liquidacion-page').then((m) => m.LiquidacionPage),
      },
      {
        path: 'resumen',
        title: 'Resumen del día',
        loadComponent: () => import('./resumen/dia/resumen-dia-page').then((m) => m.ResumenDiaPage),
      },
      {
        path: 'vender',
        title: 'Nuevo vale',
        loadComponent: () => import('./vales/nuevo/nuevo-vale-page').then((m) => m.NuevoValePage),
      },
      {
        path: 'vales',
        title: 'Vales',
        loadComponent: () => import('./vales/lista/vales-page').then((m) => m.ValesPage),
      },
      {
        path: 'ajustes',
        title: 'Ajustes',
        loadComponent: () => import('./ajustes/ajustes-page').then((m) => m.AjustesPage),
      },
      { path: '**', redirectTo: 'vender' },
    ],
  },
];
