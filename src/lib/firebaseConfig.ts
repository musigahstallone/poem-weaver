
// TODO: Replace with your Firebase project's configuration object
// This object can be found in your Firebase project settings.
// Ensure you have environment variables set up for these values.

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn(
    "Firebase API Key is missing. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file and that the Next.js development server was restarted after creating/modifying the .env.local file."
  );
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

