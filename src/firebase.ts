import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

let firebaseConfig: any = null;

// Safely probe for firebase-applet-config.json without crashing in self-hosted environments
try {
  // @ts-ignore
  const imported = await import('../firebase-applet-config.json');
  firebaseConfig = imported.default || imported;
} catch {
  // Operating in 100% self-hosted mode (no Google Cloud / Firebase config)
  firebaseConfig = null;
}

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let isFirebaseAvailable = false;

// Only initialize if a valid project configuration with actual keys is present
if (
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    authInstance = getAuth(app);
    isFirebaseAvailable = true;
  } catch {
    // Graceful fallback to self-hosted offline mode
    isFirebaseAvailable = false;
    dbInstance = null;
    authInstance = null;
  }
}

export const db = dbInstance;
export const auth = authInstance;
export { isFirebaseAvailable };

// Skill requirement: OperationType & FirestoreErrorInfo error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (!isFirebaseAvailable) return;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider: any) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

// Validate Connection to Firestore safely (only if Firebase is active)
export async function testConnection() {
  if (!isFirebaseAvailable || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Self-hosted or offline client
  }
}

testConnection();
