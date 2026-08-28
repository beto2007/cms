import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Ripple } from 'primeng/ripple';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Ripple, Tag, Avatar],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.user;
}
