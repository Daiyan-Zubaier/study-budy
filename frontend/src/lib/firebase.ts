// frontend/src/lib/firebase.ts

// 1) import the SDK pieces you need
import { initializeApp } from "firebase/app";
import { getFirestore  } from "firebase/firestore";

// 2) reference your env vars (make sure you have these in .env.local)
const firebaseConfig = {
  apiKey:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// 3) initialize and export
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// (optional) If you ever need the raw Firebase app instance:
export default app;
