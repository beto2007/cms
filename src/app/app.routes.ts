import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./home/home.component').then((module) => module.HomeComponent) },
	{ path: 'login', canActivate: [guestGuard], loadComponent: () => import('./login/login.component').then((module) => module.LoginComponent) },
	{ path: 'register', canActivate: [guestGuard], loadComponent: () => import('./register/register.component').then((module) => module.RegisterComponent) },
	{ path: 'tasks', canActivate: [authGuard], loadComponent: () => import('./tasks/tasks.component').then((module) => module.TasksComponent) },
	{ path: 'demo', loadComponent: () => import('./demo/demo.component').then((module) => module.DemoComponent) },
	{ path: '**', redirectTo: '' }
];
