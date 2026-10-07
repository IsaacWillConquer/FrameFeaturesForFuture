import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";
import { logAction } from "../logger";
import { recordLogin, trustCurrentDevice } from "../security/deviceService";

// Best-effort device/login tracking. Never let it block a successful login.
async function trackLogin(uid, detail) {
  try {
    await recordLogin(uid, detail);
    await trustCurrentDevice(uid);
  } catch { /* tracking is optional */ }
}

const messages = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/email-already-in-use": "That email is already registered.",
  "auth/account-exists-with-different-credential": "That email is already registered with a password. Log in with your password instead.",
  "auth/weak-password": "Password must be at least 8 characters.",
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
  // Force a first-login change of password (cleared by changePassword).
  await updateDoc(doc(db, COLLECTIONS.users, cred.user.uid), { mustChangePassword: true });
  await sendEmailVerification(cred.user);
  await logAction(cred.user.uid, "register");
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(cred.user);
  await logAction(cred.user.uid, "login");
  await trackLogin(cred.user.uid, "password");
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  await ensureUserDoc(cred.user);
  await logAction(cred.user.uid, "login", "google");
  await trackLogin(cred.user.uid, "google");
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

// Update the user's display name in Auth + the users/{uid} doc.
export async function updateDisplayName(name) {
  if (!auth.currentUser) return;
  await updateProfile(auth.currentUser, { displayName: name });
  await updateDoc(doc(db, COLLECTIONS.users, auth.currentUser.uid), { name });
  await logAction(auth.currentUser.uid, "profile_update", "name");
}

// Change password. Firebase requires a recent login, so reauthenticate first.
export async function changePassword(currentPassword, newPassword) {
  const u = auth.currentUser;
  const cred = EmailAuthProvider.credential(u.email, currentPassword);
  await reauthenticateWithCredential(u, cred);
  await updatePassword(u, newPassword);
  // Clears the first-login flag so the app opens (see ChangePasswordRequired).
  await updateDoc(doc(db, COLLECTIONS.users, u.uid), { mustChangePassword: false });
  await logAction(u.uid, "password_change");
}
