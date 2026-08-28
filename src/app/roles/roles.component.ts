import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../core/services/rbac.service';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { PrivilegeType, RoleConfig, RoleType } from '../core/models/rbac.model';

import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

interface ModuleRow {
  key: string;
  name: string;
  route: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    CheckboxModule,
    TagModule,
    SelectModule,
    MessageModule,
    ToastModule
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  private readonly rbacService = inject(RbacService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly roles: RoleType[] = ['admin', 'editor', 'viewer'];
  readonly privileges: PrivilegeType[] = ['select', 'create', 'update', 'delete', 'write'];

  readonly modules: ModuleRow[] = [
    { key: 'tasks', name: 'Gestión de Tareas', route: '/tasks' },
    { key: 'profile', name: 'Perfil de Usuario', route: '/profile' },
    { key: 'roles', name: 'Gestión de Roles & Permisos', route: '/roles' },
    { key: 'demo', name: 'Módulo Demo', route: '/demo' }
  ];

  // Configuración de copia editable local
  editableConfig = signal<Record<RoleType, RoleConfig>>(JSON.parse(JSON.stringify(this.rbacService.rolesConfig())));
  saving = signal(false);

  // Selector de Rol de prueba para el usuario actual
  selectedRoleForUser = signal<RoleType>(this.rbacService.currentRole());

  readonly roleOptions = [
    { label: 'Administrador (admin)', value: 'admin' },
    { label: 'Editor (editor)', value: 'editor' },
    { label: 'Visualizador (viewer)', value: 'viewer' }
  ];

  ngOnInit(): void {
    this.resetConfig();
  }

  resetConfig(): void {
    this.editableConfig.set(JSON.parse(JSON.stringify(this.rbacService.rolesConfig())));
    this.selectedRoleForUser.set(this.rbacService.currentRole());
  }

  isRouteEnabled(role: RoleType, route: string): boolean {
    return this.editableConfig()[role]?.routes?.includes(route) ?? false;
  }

  toggleRoute(role: RoleType, route: string): void {
    const config = { ...this.editableConfig() };
    const currentRoutes = [...(config[role].routes || [])];
    const index = currentRoutes.indexOf(route);

    if (index >= 0) {
      currentRoutes.splice(index, 1);
    } else {
      currentRoutes.push(route);
    }
    config[role].routes = currentRoutes;
    this.editableConfig.set({ ...config });
  }

  hasPrivilege(role: RoleType, moduleKey: string, privilege: PrivilegeType): boolean {
    return !!this.editableConfig()[role]?.permissions?.[moduleKey]?.[privilege];
  }

  togglePrivilege(role: RoleType, moduleKey: string, privilege: PrivilegeType): void {
    const config = { ...this.editableConfig() };
    if (!config[role].permissions[moduleKey]) {
      config[role].permissions[moduleKey] = {
        select: false,
        create: false,
        update: false,
        delete: false,
        write: false
      };
    }
    const currentVal = !!config[role].permissions[moduleKey][privilege];
    config[role].permissions[moduleKey][privilege] = !currentVal;
    this.editableConfig.set({ ...config });
  }

  async saveMatrix(): Promise<void> {
    this.saving.set(true);
    try {
      await this.rbacService.updateRolesConfig(this.editableConfig());
      this.notificationService.showSuccess('Éxito', 'Matriz de permisos guardada en Firestore correctamente.');
    } catch (err: any) {
      this.notificationService.showError('Error', err.message || 'No se pudo guardar la configuración.');
    } finally {
      this.saving.set(false);
    }
  }

  async switchMyRole(newRole: RoleType): Promise<void> {
    const user = this.authService.user();
    if (!user) return;
    try {
      await this.rbacService.setUserRole(user.uid, newRole);
      this.selectedRoleForUser.set(newRole);
      this.notificationService.showInfo(
        'Rol Actualizado',
        `Has cambiado tu rol a "${newRole}". Las reglas y menú se han actualizado.`
      );
    } catch (err: any) {
      this.notificationService.showError('Error', 'No se pudo actualizar tu rol.');
    }
  }

  getRoleSeverity(role: RoleType): 'danger' | 'warn' | 'info' {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'editor':
        return 'warn';
      case 'viewer':
        return 'info';
    }
  }
}
