
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
// Auth and Firestore are no longer directly used by app features after removing user accounts
// import { getAuth, type Auth } from 'firebase/auth';
// import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let app: FirebaseApp;
// let auth: Auth; // Removed
// let db: Firestore; // Removed

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// auth = getAuth(app); // Removed
// db = getFirestore(app); // Removed

// Export only the app instance if specific services are not needed by client
// Genkit might still rely on Firebase project context implicitly
export { app };
