import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { ProgressBar } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { NotificationService } from '../core/services/notification.service';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Avatar } from 'primeng/avatar';
import { BadgeDirective } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { Paginator } from 'primeng/paginator';
import { Panel } from 'primeng/panel';
import { Rating } from 'primeng/rating';
import { Skeleton } from 'primeng/skeleton';
import { Slider } from 'primeng/slider';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';

interface DemoTask {
  name: string;
  owner: string;
  status: 'Pendiente' | 'En progreso' | 'Completada';
}

interface DemoProject {
  name: string;
  team: string;
  progress: number;
  status: 'Activo' | 'En revisión' | 'Archivado';
}

interface DemoProduct {
  name: string;
  category: string;
  stock: number;
  price: number;
}

@Component({
  selector: 'app-demo',
  imports: [
    FormsModule,
    CurrencyPipe,
    RouterLink,
    ButtonDirective,
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Avatar,
    BadgeDirective,
    Card,
    Chip,
    Checkbox,
    DatePicker,
    Dialog,
    InputText,
    InputNumber,
    Message,
    MultiSelect,
    Password,
    ProgressBar,
    Paginator,
    Panel,
    Rating,
    Select,
    Skeleton,
    Slider,
    Tag,
    TableModule,
    ToggleSwitch,
    Tooltip,
    Toolbar
  ],
  templateUrl: './demo.component.html'
})
export class DemoComponent {
  private readonly notifications = inject(NotificationService);
  protected email = '';
  protected password = '';
  protected selectedPriority = 'Normal';
  protected selectedDate: Date | undefined;
  protected notificationsEnabled = true;
  protected progress = 65;
  protected dialogVisible = false;
  protected inputDialogVisible = false;
  protected alertInput = '';
  protected alertMessage = '';
  protected demoMessage = '';
  protected budget = 2500;
  protected selectedTeams: string[] = ['Producto'];
  protected rating = 4;
  protected effort = 40;
  protected page = 0;
  protected readonly teams = ['Producto', 'Diseño', 'Ingeniería', 'Marketing'];
  protected readonly icons = [
    { name: 'Home', className: 'pi-home' },
    { name: 'Search', className: 'pi-search' },
    { name: 'User', className: 'pi-user' },
    { name: 'Settings', className: 'pi-cog' },
    { name: 'Calendar', className: 'pi-calendar' },
    { name: 'Bell', className: 'pi-bell' },
    { name: 'Check', className: 'pi-check' },
    { name: 'Plus', className: 'pi-plus' },
    { name: 'Edit', className: 'pi-pencil' },
    { name: 'Delete', className: 'pi-trash' },
    { name: 'Download', className: 'pi-download' },
    { name: 'Arrow right', className: 'pi-arrow-right' }
  ];

  protected readonly priorities = ['Baja', 'Normal', 'Alta'];
  protected readonly tasks: DemoTask[] = [
    { name: 'Preparar informe mensual', owner: 'Ana', status: 'En progreso' },
    { name: 'Revisar contenido publicado', owner: 'Luis', status: 'Pendiente' },
    { name: 'Validar métricas del sitio', owner: 'Marta', status: 'Completada' }
  ];
  protected readonly projects: DemoProject[] = [
    { name: 'Rediseño del portal', team: 'Producto', progress: 82, status: 'Activo' },
    { name: 'Campaña de lanzamiento', team: 'Marketing', progress: 56, status: 'En revisión' },
    { name: 'Migración legacy', team: 'Ingeniería', progress: 100, status: 'Archivado' }
  ];
  protected readonly products: DemoProduct[] = [
    { name: 'Licencia Basic', category: 'Planes', stock: 18, price: 29 },
    { name: 'Licencia Pro', category: 'Planes', stock: 7, price: 79 },
    { name: 'Soporte premium', category: 'Servicios', stock: 0, price: 149 }
  ];

  protected increaseProgress(): void {
    this.progress = Math.min(this.progress + 10, 100);
    this.demoMessage = `Progreso actualizado al ${this.progress}%.`;
  }

  protected saveDemo(): void {
    this.demoMessage = 'Cambios guardados correctamente.';
    this.notifications.success(this.demoMessage);
  }

  protected cancelDemo(): void {
    this.demoMessage = 'Acción cancelada.';
    this.notifications.info(this.demoMessage);
  }

  protected openInputDialog(): void {
    this.inputDialogVisible = true;
  }

  protected saveInputDialog(): void {
    if (!this.alertInput.trim()) {
      this.alertMessage = 'Escribe un valor antes de continuar.';
      return;
    }

    this.inputDialogVisible = false;
    this.alertMessage = `Valor guardado: ${this.alertInput.trim()}`;
    this.notifications.success(this.alertMessage);
  }

  protected showToast(): void {
    this.notifications.info('Este es un mensaje temporal de la aplicación.', 'Toast demo');
  }

  protected onPageChange(event: { page?: number }): void {
    this.page = event.page ?? 0;
    this.demoMessage = `Página ${this.page + 1} seleccionada.`;
  }

  protected statusSeverity(status: DemoTask['status']): 'success' | 'info' | 'warn' {
    return status === 'Completada' ? 'success' : status === 'En progreso' ? 'info' : 'warn';
  }

  protected projectSeverity(status: DemoProject['status']): 'success' | 'info' | 'secondary' {
    return status === 'Activo' ? 'success' : status === 'En revisión' ? 'info' : 'secondary';
  }
}
