import { Injectable, signal } from '@angular/core';

export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

export interface NotificationState {
  severity: NotificationSeverity;
  detail: string;
  summary: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly current = signal<NotificationState | null>(null);
  private clearTimer: ReturnType<typeof setTimeout> | undefined;

  success(detail: string, summary = 'Listo'): void {
    this.show('success', detail, summary);
  }

  error(detail: string, summary = 'Algo salió mal'): void {
    this.show('error', detail, summary);
  }

  info(detail: string, summary = 'Información'): void {
    this.show('info', detail, summary);
  }

  clear(): void {
    this.current.set(null);
    if (this.clearTimer) clearTimeout(this.clearTimer);
  }

  private show(severity: NotificationSeverity, detail: string, summary: string): void {
    this.current.set({ severity, detail, summary });
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(() => this.current.set(null), 5000);
  }
}
