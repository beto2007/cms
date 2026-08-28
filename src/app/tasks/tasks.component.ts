import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, catchError, of } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { Task, TasksService } from '../core/services/tasks.service';
import { TaskFormComponent } from './task-form.component';

@Component({
  selector: 'app-tasks',
  imports: [AsyncPipe, DatePipe, TaskFormComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  protected readonly user = this.authService.user;
  protected tasks$: Observable<Task[]> = of([]);
  protected loadError = false;
  protected readonly deletingId = signal<string | null>(null);
  protected readonly deleteError = signal('');

  ngOnInit(): void {
    this.authService.authStateReady().then((currentUser) => {
      if (currentUser) this.loadTasks(currentUser);
    });
  }

  protected async logout(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigateByUrl('/login');
  }

  protected async deleteTask(task: Task): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !task.id) return;

    this.deletingId.set(task.id);
    this.deleteError.set('');
    try {
      await this.tasksService.deleteTask(currentUser, task.id);
      this.loadTasks(currentUser);
    } catch (error) {
      this.deleteError.set((error as { code?: string }).code === 'permission-denied'
        ? 'No tienes permiso para eliminar esta tarea.'
        : 'No se pudo eliminar la tarea. Inténtalo de nuevo.');
    } finally {
      this.deletingId.set(null);
    }
  }

  private loadTasks(currentUser: User): void {
    this.loadError = false;
    this.tasks$ = this.tasksService.getTasks(currentUser).pipe(
      catchError(() => {
        this.loadError = true;
        return of([]);
      })
    );
  }

  protected refreshTasks(): void {
    const currentUser = this.user();
    if (currentUser) this.loadTasks(currentUser);
  }
}
