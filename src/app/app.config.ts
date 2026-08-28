import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

const firebaseApp = getApps().length > 0
  ? getApps()[0]
  : initializeApp(environment.firebase);
const firestore = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: 'FIREBASE_AUTH', useValue: getAuth(firebaseApp) },
    { provide: 'FIRESTORE', useValue: firestore }
  ]
};
