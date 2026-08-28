import { Inject, Injectable, computed, signal } from '@angular/core';
import { Firestore, doc, docData, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { DEFAULT_ROLES_CONFIG, PrivilegeType, RoleConfig, RoleType } from '../models/rbac.model';
import { Observable, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RbacService {
  // Roles matrix dynamic signal
  readonly rolesConfig = signal<Record<RoleType, RoleConfig>>(DEFAULT_ROLES_CONFIG);
  readonly currentRole = signal<RoleType>('admin');

  readonly currentUserConfig = computed(() => {
    return this.rolesConfig()[this.currentRole()] || DEFAULT_ROLES_CONFIG.viewer;
  });

  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
    private readonly authService: AuthService
  ) {
    this.initRbac();
  }

  private async initRbac(): Promise<void> {
    // Escuchar el usuario auth para cargar su rol desde Firestore
    const user = await this.authService.authStateReady();
    if (user) {
      await this.loadUserRole(user.uid);
    }

    // Cargar matriz RBAC desde Firestore
    await this.loadRolesConfig();
  }

  async loadRolesConfig(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'settings', 'rbac');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Record<RoleType, RoleConfig>;
        this.rolesConfig.set({ ...DEFAULT_ROLES_CONFIG, ...data });
      } else {
        // Inicializar documento con valores por defecto en Firestore
        await setDoc(docRef, DEFAULT_ROLES_CONFIG);
        this.rolesConfig.set(DEFAULT_ROLES_CONFIG);
      }
    } catch (err) {
      console.warn('Error al cargar configuración RBAC de Firestore, usando valores locales por defecto:', err);
      this.rolesConfig.set(DEFAULT_ROLES_CONFIG);
    }
  }

  async loadUserRole(uid: string): Promise<RoleType> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists() && snap.data()['role']) {
        const role = snap.data()['role'] as RoleType;
        this.currentRole.set(role);
        return role;
      } else {
        // Si no tiene rol asignado, asignar 'admin' por defecto o 'viewer'
        const defaultRole: RoleType = 'admin';
        await setDoc(userDocRef, { role: defaultRole }, { merge: true });
        this.currentRole.set(defaultRole);
        return defaultRole;
      }
    } catch (err) {
      console.warn('Error al cargar rol de usuario, usando rol por defecto admin:', err);
      this.currentRole.set('admin');
      return 'admin';
    }
  }

  async setUserRole(uid: string, role: RoleType): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    await setDoc(userDocRef, { role }, { merge: true });
    if (this.authService.user()?.uid === uid) {
      this.currentRole.set(role);
    }
  }

  async updateRolesConfig(config: Record<RoleType, RoleConfig>): Promise<void> {
    const docRef = doc(this.firestore, 'settings', 'rbac');
    await setDoc(docRef, config);
    this.rolesConfig.set(config);
  }

  hasPrivilege(moduleKey: string, privilege: PrivilegeType): boolean {
    const roleConfig = this.currentUserConfig();
    const modulePerms = roleConfig.permissions?.[moduleKey];
    if (!modulePerms) return false;
    return !!modulePerms[privilege];
  }

  hasRouteAccess(routePath: string): boolean {
    const roleConfig = this.currentUserConfig();
    const normalizedRoute = routePath.startsWith('/') ? routePath : '/' + routePath;

    // Si la lista de rutas incluye la ruta o si la ruta es '/'
    if (roleConfig.routes?.includes(normalizedRoute)) {
      return true;
    }

    return false;
  }
}
