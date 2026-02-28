import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Admin SDK inicializado APENAS no servidor (Server Components, API Routes).
 * NUNCA importe este arquivo em Client Components.
 */

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  // Em produção: usar variáveis de ambiente
  // Em dev com emulador: usar GOOGLE_APPLICATION_CREDENTIALS
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // A chave privada vem com \n escapado no .env — precisamos converter
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });

  return adminApp;
}

// Lazy initialization para evitar erro em builds que não usam o Admin SDK
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
