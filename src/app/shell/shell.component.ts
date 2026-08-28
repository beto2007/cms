import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  /** En desktop arranca expandido; en mobile arranca colapsado */
  protected readonly sidebarVisible = signal(window.innerWidth > 768);
  protected readonly isMobile = signal(window.innerWidth <= 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth <= 768);
    // Al agrandar la ventana, el sidebar se muestra automáticamente
    if (window.innerWidth > 768 && !this.sidebarVisible()) {
      this.sidebarVisible.set(true);
    }
  }

  protected toggleSidebar(): void {
    this.sidebarVisible.update((v) => !v);
  }

  protected closeSidebarOnMobile(): void {
    if (this.isMobile()) {
      this.sidebarVisible.set(false);
    }
  }
}
