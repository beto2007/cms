import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'firebase/auth';
import { TasksService } from '../core/services/tasks.service';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { NotificationService } from '../core/services/notification.service';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule, ButtonDirective, InputText, Textarea, Card],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent {
  @Input({ required: true }) user!: User;
  @Output() taskCreated = new EventEmitter<void>();

  private readonly tasksService = inject(TasksService);
  private readonly notifications = inject(NotificationService);
  protected title = '';
  protected description = '';
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    if (!this.title.trim()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.tasksService.createTask(this.user, this.title, this.description);
      this.title = '';
      this.description = '';
      this.taskCreated.emit();
      this.notifications.success('La tarea se creó correctamente.');
    } catch (error) {
      this.error.set(this.getErrorMessage(error));
      this.notifications.error(this.error());
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
