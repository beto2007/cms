import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, Button, Card],
  template: `
    <div class="flex justify-content-center align-items-center min-h-screen p-4 surface-ground">
      <p-card styleClass="max-w-30rem text-center shadow-4 border-round-xl p-3">
        <div class="mb-4 text-red-500">
          <i class="pi pi-lock text-6xl"></i>
        </div>
        <h2 class="text-3xl font-bold text-900 mb-2">Acceso Denegado (403)</h2>
        <p class="text-6xl-surface text-color-secondary mb-4">
          Tu rol actual no tiene permisos para acceder a este módulo o ruta. Si consideras que esto es un error, solicita acceso a un Administrador.
        </p>
        <div class="flex justify-content-center gap-3">
          <a routerLink="/" pButton label="Volver al Inicio" icon="pi pi-home" class="p-button-primary"></a>
        </div>
      </p-card>
    </div>
  `
})
export class UnauthorizedComponent {}
