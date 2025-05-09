import { Routes } from '@angular/router';
import { GuestGuard } from './guards/guest.guard';
import { AuthGuard }  from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/page.component').then(m => m.HomePageComponent),
    canActivate: [ GuestGuard ],      
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./cadastro/page.component').then(m => m.CadastroPageComponent),
    canActivate: [ GuestGuard ],      
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/page.component').then(m => m.DashboardPageComponent),
    canActivate: [ AuthGuard ],      
  },
  {
    path: 'clinicas',
    loadComponent: () =>
      import('./clinicas/page.component').then(m => m.ClinicaPageComponent),
    canActivate: [ AuthGuard ],      
  },
  {
    path: 'clinicas/cadastro',
    loadComponent: () =>
      import('./clinicas/create/page.component').then(m => m.ClinicaCreateComponent),
    canActivate: [ AuthGuard ],      
  },
  {
    path: 'clinicas/editar/:id',
    loadComponent: () =>
      import('./clinicas/create/page.component').then(m => m.ClinicaCreateComponent),
    canActivate: [ AuthGuard ],      
  },
];