import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonDirective, Card],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  protected readonly user = inject(AuthService).user;
}

