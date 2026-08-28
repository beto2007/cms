import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Card } from 'primeng/card';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Firestore, doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  email: string;
}

@Component({
  selector: 'app-profile',
  imports: [RouterLink, Card, Avatar, Button, Divider],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
  protected readonly profileData = signal<UserProfile | null>(null);
  protected readonly loadingProfile = signal(true);

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {}

  ngOnInit(): void {
    this.authService.authStateReady().then((currentUser) => {
      if (currentUser) {
        this.fetchProfile(currentUser.uid);
      }
    });
  }

  private async fetchProfile(uid: string): Promise<void> {
    this.loadingProfile.set(true);
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.profileData.set(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error cargando el perfil desde Firestore:', error);
    } finally {
      this.loadingProfile.set(false);
    }
  }

  protected get userInitial(): string {
    const email = this.userEmail;
    return email.charAt(0).toUpperCase() || 'U';
  }

  protected get userEmail(): string {
    return this.profileData()?.email ?? this.user()?.email ?? 'No especificado';
  }

  protected get firstName(): string {
    return this.profileData()?.firstName ?? this.user()?.displayName?.split(' ')[0] ?? '';
  }

  protected get lastName(): string {
    return this.profileData()?.lastName ?? this.user()?.displayName?.split(' ').slice(1).join(' ') ?? '';
  }

  protected get phoneNumber(): string {
    return this.profileData()?.phoneNumber ?? 'No registrado';
  }

  protected get displayName(): string {
    if (this.profileData()) {
      return `${this.profileData()?.firstName} ${this.profileData()?.lastName}`;
    }
    return this.user()?.displayName ?? this.userEmail;
  }

  protected get userUid(): string {
    return this.user()?.uid ?? 'No disponible';
  }

  protected get creationTime(): string {
    const time = this.user()?.metadata.creationTime;
    return time ? new Date(time).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'No disponible';
  }

  protected get lastSignInTime(): string {
    const time = this.user()?.metadata.lastSignInTime;
    return time ? new Date(time).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'No disponible';
  }

  protected get providerId(): string {
    const provider = this.user()?.providerData?.[0]?.providerId;
    if (provider === 'password') return 'Correo y contraseña';
    return provider || 'Firebase Auth';
  }
}
