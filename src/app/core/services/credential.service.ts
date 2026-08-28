import { Inject, Injectable, effect, inject, signal } from '@angular/core';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { AuthService } from './auth.service';

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CredentialService {
  private readonly authService = inject(AuthService);

  private readonly userSession = signal<UserSession | null>(null);
  readonly session = this.userSession.asReadonly();

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    // Escuchar reactivamente los cambios de autenticación del usuario
    effect((onCleanup) => {
      const currentUser = this.authService.user();
      if (!currentUser) {
        this.userSession.set(null);
        return;
      }

      // Escuchar en tiempo real el documento del usuario en Firestore
      const docRef = doc(this.firestore, 'users', currentUser.uid);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.userSession.set({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              firstName: data['firstName'],
              lastName: data['lastName'],
              phoneNumber: data['phoneNumber'],
              createdAt: data['createdAt']
            });
          } else {
            // Caso de respaldo si no hay datos en Firestore aún (ej. usuarios viejos)
            this.userSession.set({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              firstName: currentUser.displayName?.split(' ')[0] || '',
              lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
              phoneNumber: null
            });
          }
        },
        (error) => {
          console.error('Error escuchando actualizaciones de perfil en Firestore:', error);
          // Fallback con datos locales
          this.userSession.set({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            firstName: currentUser.displayName?.split(' ')[0] || '',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            phoneNumber: null
          });
        }
      );

      // Limpiar suscripción cuando el usuario cambia o cierra sesión
      onCleanup(() => {
        unsubscribe();
      });
    });
  }
}
