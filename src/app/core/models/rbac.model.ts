export type RoleType = 'admin' | 'editor' | 'viewer';

export type PrivilegeType = 'select' | 'create' | 'update' | 'delete' | 'write';

export interface ModulePermission {
  moduleKey: string;
  moduleName: string;
  route: string;
  privileges: Record<PrivilegeType, boolean>;
}

export interface RoleConfig {
  role: RoleType;
  label: string;
  description: string;
  routes: string[]; // List of routes accessible by this role
  permissions: Record<string, Record<PrivilegeType, boolean>>; // moduleKey -> privileges
}

export interface UserRoleData {
  uid: string;
  email: string;
  role: RoleType;
}

export const DEFAULT_ROLES_CONFIG: Record<RoleType, RoleConfig> = {
  admin: {
    role: 'admin',
    label: 'Administrador',
    description: 'Acceso total y todos los privilegios (select, create, update, delete, write)',
    routes: ['/', '/tasks', '/profile', '/roles', '/demo'],
    permissions: {
      tasks: { select: true, create: true, update: true, delete: true, write: true },
      profile: { select: true, create: true, update: true, delete: true, write: true },
      roles: { select: true, create: true, update: true, delete: true, write: true },
      demo: { select: true, create: true, update: true, delete: true, write: true }
    }
  },
  editor: {
    role: 'editor',
    label: 'Editor',
    description: 'Acceso limitado: delete, write, create, update, select (sin gestión de roles/administración)',
    routes: ['/', '/tasks', '/profile', '/demo'],
    permissions: {
      tasks: { select: true, create: true, update: true, delete: true, write: true },
      profile: { select: true, create: true, update: true, delete: false, write: true },
      roles: { select: false, create: false, update: false, delete: false, write: false },
      demo: { select: true, create: true, update: true, delete: false, write: true }
    }
  },
  viewer: {
    role: 'viewer',
    label: 'Viewer (Visualizador)',
    description: 'Acceso limitado únicamente a lectura (select)',
    routes: ['/', '/tasks', '/profile', '/demo'],
    permissions: {
      tasks: { select: true, create: false, update: false, delete: false, write: false },
      profile: { select: true, create: false, update: false, delete: false, write: false },
      roles: { select: false, create: false, update: false, delete: false, write: false },
      demo: { select: true, create: false, update: false, delete: false, write: false }
    }
  }
};
