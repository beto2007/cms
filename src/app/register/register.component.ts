import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.scss'
})
export class RegisterComponent {
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
      await this.authService.signUp(this.email, this.password);
      await this.router.navigateByUrl('/tasks');
    } catch (error) {
      const code = (error as { code?: string }).code;
      this.error.set(code === 'auth/email-already-in-use'
        ? 'Este correo ya tiene una cuenta.'
        : code === 'auth/weak-password'
          ? 'La contraseña debe tener al menos 6 caracteres.'
          : code === 'auth/invalid-email'
            ? 'Escribe un correo electrónico válido.'
            : 'No se pudo crear la cuenta. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
