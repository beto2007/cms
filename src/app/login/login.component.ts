import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { NotificationService } from '../core/services/notification.service';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, ButtonDirective, InputText, Password, Card],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.signIn(this.email, this.password);
      this.notifications.success('Sesión iniciada correctamente.');
      await this.router.navigateByUrl('/tasks');
    } catch (error) {
      this.error.set(this.getErrorMessage(error));
      this.notifications.error(this.error());
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    const code = (error as { code?: string }).code;
    return code === 'auth/invalid-credential'
      ? 'El correo o la contraseña no son correctos.'
      : code === 'auth/invalid-email'
        ? 'Escribe un correo electrónico válido.'
        : 'No se pudo iniciar sesión. Inténtalo de nuevo.';
  }
}
