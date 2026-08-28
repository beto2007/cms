import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly mode = signal<'login' | 'signup'>('login');
  protected email = '';
  protected password = '';

  protected async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.mode() === 'login') {
        await this.authService.signIn(this.email, this.password);
      } else {
        await this.authService.signUp(this.email, this.password);
      }
    } catch (error) {
      this.error.set(this.getErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected async logout(): Promise<void> {
    await this.authService.signOut();
  }

  protected toggleMode(): void {
    this.mode.update((currentMode) => currentMode === 'login' ? 'signup' : 'login');
    this.error.set('');
  }

  private getErrorMessage(error: unknown): string {
    const code = (error as { code?: string }).code;
    const messages: Record<string, string> = {
      'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
      'auth/email-already-in-use': 'Este correo ya tiene una cuenta.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-email': 'Escribe un correo electrónico válido.'
    };
    return messages[code ?? ''] ?? 'No se pudo completar la operación. Inténtalo de nuevo.';
  }
}
