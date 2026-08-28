import { Component, Input, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from 'firebase/auth';
import { TasksService } from '../core/services/tasks.service';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { NotificationService } from '../core/services/notification.service';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, ButtonDirective, InputText, Textarea, Card],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent {
  @Input({ required: true }) user!: User;

  private readonly tasksService = inject(TasksService);
  private readonly notifications = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(500)]
  });
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { title, description } = this.taskForm.getRawValue();
    this.saving.set(true);
    this.error.set('');
    try {
      await this.tasksService.createTask(this.user, title, description);
      this.taskForm.reset();
      this.notifications.success('La tarea se creó correctamente.');
    } catch (error) {
      this.error.set(this.getErrorMessage(error));
      const code = (error as { code?: string }).code;
      const detail = code ? `${this.error()} (${code})` : this.error();
      this.notifications.error(detail);
    } finally {
      this.saving.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    const code = (error as { code?: string }).code;
    if (code === 'permission-denied') {
      return 'Firestore rechazó la tarea. Revisa las reglas de seguridad.';
    }
    if (code === 'failed-precondition') {
      return 'Firestore no está listo o falta configuración del proyecto.';
    }
    return 'No se pudo crear la tarea. Inténtalo de nuevo.';
  }
}
