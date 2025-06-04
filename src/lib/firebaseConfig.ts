
// TODO: Replace with your Firebase project's configuration object
// This object can be found in your Firebase project settings.
// Ensure you have environment variables set up for these values.

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error(
    "CRITICAL: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or not loaded into the environment. \n" +
    "1. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set with a valid value in your .env.local file (in the project root). Double-check for typos. \n" +
    "2. If you recently created or modified the .env.local file, YOU MUST RESTART your Next.js development server for changes to take effect. \n" +
    "This is a very common cause of 'Firebase: Error (auth/invalid-api-key)'. \n" +
    "3. Verify the API key in your Firebase Console under Project settings > General > Your apps > SDK setup and configuration."
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

