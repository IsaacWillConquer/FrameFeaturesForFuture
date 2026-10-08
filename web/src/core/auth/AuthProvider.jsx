import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

const AuthContext = createContext(null);
const passedKey = (uid) => "awa_2fa_" + uid; // sessionStorage: cleared when the tab closes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // the users/{uid} doc (has the role)
  const [verified, setVerified] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [twoFactorPassed, setTwoFactorPassed] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [securityError, setSecurityError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfile(u) {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.users, u.uid));
      setProfile(snap.exists() ? snap.data() : null);
      setProfileError(false);
    } catch (err) {
      // Fail closed: without the profile the gates stay shut, like on mobile.
      console.error("Could not load profile:", err);
      setProfile(null);
      setProfileError(true);
    }
    try {
      const totpSnap = await getDoc(doc(db, COLLECTIONS.totp, u.uid));
      setTotpEnabled(totpSnap.exists() && totpSnap.data().enabled === true);
      setSecurityError(false);
    } catch (err) {
      // Fail closed: if we can't confirm whether 2FA is on, we must not let the
      // user skip the 2FA gate. The guard shows a retry screen instead.
      console.error("Could not load 2FA status:", err);
      setSecurityError(true);
    }
    setTwoFactorPassed(sessionStorage.getItem(passedKey(u.uid)) === "1");
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      setUser(u);
      if (u) {
        setVerified(u.emailVerified);
        await loadProfile(u);
      } else {
        setProfile(null);
        setVerified(false);
        setTotpEnabled(false);
        setTwoFactorPassed(false);
        setProfileError(false);
        setSecurityError(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Call after register, Google login, enabling 2FA, or "I verified my email"
  async function refresh() {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setVerified(auth.currentUser.emailVerified);
    await loadProfile(auth.currentUser);
  }

  // Call after a correct 2FA code
  function passTwoFactor() {
    if (!auth.currentUser) return;
    sessionStorage.setItem(passedKey(auth.currentUser.uid), "1");
    setTwoFactorPassed(true);
  }

  const value = {
    user,
    profile,
    role: profile?.role || "user",
    verified,
    totpEnabled,
    twoFactorPassed,
    mustChangePassword: profile?.mustChangePassword === true,
    profileError,
    securityError,
    loading,
    refresh,
    passTwoFactor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
