import { Component, inject, output, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Toolbar, Button, Avatar, Menu],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly toggleSidebar = output<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.user;
  protected readonly profileMenu = viewChild.required<Menu>('profileMenu');

  protected readonly profileItems: MenuItem[] = [
    {
      label: 'Perfil',
      items: [
        {
          label: this.userEmail
        },
        {
          label: 'Mi cuenta',
          icon: 'pi pi-user',
          routerLink: ['/profile']
        },
        {
          label: 'Cerrar sesión',
          icon: 'pi pi-sign-out',
          command: () => this.signOut()
        }
      ]
    }
  ];

  protected get userInitial(): string {
    const email = this.user()?.email ?? '';
    return email.charAt(0).toUpperCase() || 'U';
  }

  protected get userEmail(): string {
    return this.user()?.email ?? '';
  }

  protected toggleProfileMenu(event: Event): void {
    this.profileMenu().toggle(event);
  }

  private async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
