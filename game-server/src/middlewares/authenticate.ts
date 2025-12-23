import * as admin from "firebase-admin";
import type { Context, Next } from "hono";

const verifyFirebaseToken = async (token: string) => {
  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken; // Returns decoded user data from token
  } catch (err) {
    console.error(err);
    throw new Error("Unauthorized "); // Handle invalid token or errors
  }
};

async function authenticate(c: Context, next: Next) {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ message: "Authorization token missing." }, 401);
  }

  try {
    const decodedToken = await verifyFirebaseToken(token);
    c.set("user", decodedToken);
    next();
  } catch (e) {
    const err = e as { message: string };
    return c.json({ message: err.message }, 401);
  }
}

export default authenticate;
