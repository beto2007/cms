import { Inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  private readonly authReady: Promise<User | null>;
  private authInitialized = false;

  constructor(@Inject('FIREBASE_AUTH') private readonly auth: Auth) {
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

  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
