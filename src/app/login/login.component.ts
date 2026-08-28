import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.signIn(this.email, this.password);
      await this.router.navigateByUrl('/tasks');
    } catch (error) {
      this.error.set(this.getErrorMessage(error));
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
