import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'vender' },
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
  { path: '**', redirectTo: 'vender' },
];
