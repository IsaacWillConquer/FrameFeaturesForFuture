import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";
import { logAction } from "../logger";

const messages = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/email-already-in-use": "That email is already registered.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many tries. Wait a bit and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed.",
  "auth/invalid-email": "That email doesn't look right.",
  "permission-denied": "Blocked by database rules. Check firestore.rules.",
};

export function authErrorMessage(err) {
  return messages[err.code] || err.message;
}

// Creates users/{uid} the first time someone signs in. Role is always "user" here.
async function ensureUserDoc(user, name) {
  const ref = doc(db, COLLECTIONS.users, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      name: name || user.displayName || "",
      role: "user",
      active: true,
      createdAt: serverTimestamp(),
    });
  }
}

export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await ensureUserDoc(cred.user, name);
  await sendEmailVerification(cred.user);
  await logAction(cred.user.uid, "register");
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(cred.user);
  await logAction(cred.user.uid, "login");
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  await ensureUserDoc(cred.user);
  await logAction(cred.user.uid, "login", "google");
  return cred.user;
}

export async function logoutUser() {
  if (auth.currentUser) {
    sessionStorage.removeItem("awa_2fa_" + auth.currentUser.uid);
    await logAction(auth.currentUser.uid, "logout");
  }
  await signOut(auth);
}

export function resendVerification() {
  return sendEmailVerification(auth.currentUser);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}
