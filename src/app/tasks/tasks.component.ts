import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { catchError, of } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { Task, TasksService } from '../core/services/tasks.service';
import { TaskFormComponent } from './task-form/task-form.component';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { NotificationService } from '../core/services/notification.service';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'app-tasks',
  imports: [DatePipe, TaskFormComponent, Button, Card, Tag, Divider],
  templateUrl: './tasks.component.html'
})
export class TasksComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = this.authService.user;
  protected readonly tasks = signal<Task[]>([]);
  protected loadError = false;
  protected readonly deletingId = signal<string | null>(null);
  protected readonly deleteError = signal('');

  ngOnInit(): void {
    this.authService.authStateReady().then((currentUser) => {
      if (currentUser) {
        this.loadTasks(currentUser);
      }
    });
  }

  protected async logout(): Promise<void> {
    await this.authService.signOut();
    this.notifications.info('Sesión cerrada correctamente.');
    await this.router.navigateByUrl('/login');
  }

  protected async deleteTask(task: Task): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !task.id) return;

    this.deletingId.set(task.id);
    this.deleteError.set('');
    try {
      await this.tasksService.deleteTask(currentUser, task.id);
      this.notifications.success('La tarea se eliminó correctamente.');
    } catch (error) {
      this.deleteError.set(
        (error as { code?: string }).code === 'permission-denied'
          ? 'No tienes permiso para eliminar esta tarea.'
          : 'No se pudo eliminar la tarea. Inténtalo de nuevo.'
      );
      this.notifications.error(this.deleteError());
    } finally {
      this.deletingId.set(null);
    }
  }

  private loadTasks(currentUser: User): void {
    this.loadError = false;
    const subscription = this.tasksService.getTasks(currentUser).pipe(
      catchError(() => {
        this.loadError = true;
        return of([]);
      })
    ).subscribe((taskList) => {
      this.tasks.set(taskList);
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
