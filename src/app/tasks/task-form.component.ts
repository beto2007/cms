import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'firebase/auth';
import { TasksService } from '../core/services/tasks.service';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  @Input({ required: true }) user!: User;
  @Output() taskCreated = new EventEmitter<void>();

  private readonly tasksService = inject(TasksService);
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
    } catch (error) {
      this.error.set(this.getErrorMessage(error));
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
