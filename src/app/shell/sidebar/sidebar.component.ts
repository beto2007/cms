import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RbacService } from '../../core/services/rbac.service';
import { Ripple } from 'primeng/ripple';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Ripple, Tag, Avatar, UpperCasePipe],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  protected readonly rbacService = inject(RbacService);

  protected readonly user = this.authService.user;
  protected readonly currentRole = this.rbacService.currentRole;

  protected hasRouteAccess(route: string): boolean {
    return this.rbacService.hasRouteAccess(route);
  }

  protected getRoleSeverity(role: string): 'danger' | 'warn' | 'info' {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'editor':
        return 'warn';
      default:
        return 'info';
    }
  }
}
