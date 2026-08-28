import { Inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { Firestore, doc, setDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  private readonly authReady: Promise<User | null>;
  private authInitialized = false;

  constructor(
    @Inject('FIREBASE_AUTH') private readonly auth: Auth,
    @Inject('FIRESTORE') private readonly firestore: Firestore
  ) {
    this.authReady = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.user.set(user);
        this.authInitialized = true;
        resolve(user);
      });
    });
  }

  authStateReady(): Promise<User | null> {
    return this.authInitialized ? Promise.resolve(this.user()) : this.authReady;
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = credential.user;

    // Actualizar el perfil en Firebase Auth
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    // Guardar detalles adicionales en Firestore
    const userDocRef = doc(this.firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      email,
      createdAt: new Date().toISOString()
    });

    // Actualizar localmente el signal del usuario con el displayName asignado
    this.user.set({ ...user, displayName: `${firstName} ${lastName}` } as User);

    return credential;
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
