import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { rbacGuard } from './core/guards/rbac.guard';

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
  {
    path: 'unauthorized',
    loadComponent: () => import('./unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent)
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
        canActivate: [authGuard, rbacGuard],
        loadComponent: () => import('./tasks/tasks.component').then((m) => m.TasksComponent)
      },
      {
        path: 'profile',
        canActivate: [authGuard, rbacGuard],
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'roles',
        canActivate: [authGuard, rbacGuard],
        loadComponent: () => import('./roles/roles.component').then((m) => m.RolesComponent)
      },
      {
        path: 'demo',
        loadComponent: () => import('./demo/demo.component').then((m) => m.DemoComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
