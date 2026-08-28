import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas SIN shell (login y registro)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent)
  },

  // Rutas CON shell (App Shell como layout padre)
  {
    path: '',
    loadComponent: () => import('./shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'tasks',
        canActivate: [authGuard],
        loadComponent: () => import('./tasks/tasks.component').then((m) => m.TasksComponent)
      },
      {
        path: 'demo',
        loadComponent: () => import('./demo/demo.component').then((m) => m.DemoComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
