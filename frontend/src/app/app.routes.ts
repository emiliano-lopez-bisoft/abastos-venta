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
    path: 'vender',
    title: 'Nuevo vale',
    loadComponent: () => import('./vales/nuevo/nuevo-vale-page').then((m) => m.NuevoValePage),
  },
  { path: '**', redirectTo: 'vender' },
];
