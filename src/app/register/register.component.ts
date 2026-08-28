import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { NotificationService } from '../core/services/notification.service';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, Password, Card],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber: ['']
  });

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password, firstName, lastName, phoneNumber } = this.registerForm.getRawValue();

    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.signUp(email, password, firstName, lastName, phoneNumber);
      this.notifications.success(`¡Bienvenido, ${firstName}! Tu cuenta ha sido creada con éxito.`);
      await this.router.navigateByUrl('/');
    } catch (error) {
      const code = (error as { code?: string }).code;
      this.error.set(code === 'auth/email-already-in-use'
        ? 'Este correo ya tiene una cuenta.'
        : code === 'auth/weak-password'
          ? 'La contraseña debe tener al menos 6 caracteres.'
          : code === 'auth/invalid-email'
            ? 'Escribe un correo electrónico válido.'
            : 'No se pudo crear la cuenta. Inténtalo de nuevo.');
      this.notifications.error(this.error());
    } finally {
      this.loading.set(false);
    }
  }
}
