import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Get the Base64-encoded service account key from environment variable
const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_KEY_BASE64;

// Decode the base64 string into a JSON object
if (!serviceAccountBase64) {
  throw new Error(
    "SERVICE_ACCOUNT_KEY_BASE64 is not set in the environment variables",
  );
}

const serviceAccountJson = Buffer.from(serviceAccountBase64, "base64").toString(
  "utf-8",
);

// Parse the JSON string into an object
const serviceAccount = JSON.parse(serviceAccountJson);

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert({
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    projectId: serviceAccount.project_id,
  }),
});

// Get Firestore and Messaging
const db = getFirestore();
export const messaging = getMessaging();

export default db;
