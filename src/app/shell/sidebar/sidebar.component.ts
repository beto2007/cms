import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Avatar } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';
import { Divider } from 'primeng/divider';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Avatar, Ripple, Divider, Button, Tag],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.user;

  protected get userInitial(): string {
    const email = this.user()?.email ?? '';
    return email.charAt(0).toUpperCase() || 'U';
  }

  protected get userEmail(): string {
    return this.user()?.email ?? 'Invitado';
  }

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
