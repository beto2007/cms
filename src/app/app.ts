import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Message } from 'primeng/message';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Message],
  templateUrl: './app.html'
})
export class App {
  protected readonly notification = inject(NotificationService);
}
