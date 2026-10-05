import {
  addDoc, collection, doc, getDoc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";

// ---------------------------------------------------------------------------
// SIMULATED wallet + QR payment. Fake money, no real provider. We keep a
// running balance per user and a transactions ledger. Capstone: replace the
// balance math with a server that talks to a real payment/SMS provider.
// ---------------------------------------------------------------------------
const STARTING_BALANCE = 500;

export async function getWallet(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.wallets, uid));
  if (snap.exists()) return { id: uid, ...snap.data() };
  const fresh = { uid, balance: STARTING_BALANCE, createdAt: serverTimestamp() };
  await setDoc(doc(db, COLLECTIONS.wallets, uid), fresh);
  return { id: uid, ...fresh };
}

export async function getTransactions(uid) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.transactions), where("uid", "==", uid)));
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return list.slice(0, 30);
}

// Send fake money to another user's account.
export async function payTo(fromUid, toUid, amount, note) {
  const value = Number(amount);
  if (!value || value <= 0) throw new Error("Enter an amount greater than zero.");

  const wallet = await getWallet(fromUid);
  if (wallet.balance < value) throw new Error("Not enough balance.");

  const batch = [];
  batch.push(updateDoc(doc(db, COLLECTIONS.wallets, fromUid), { balance: increment(-value) }));
  batch.push(setDoc(doc(db, COLLECTIONS.wallets, toUid), { balance: increment(value), uid: toUid }, { merge: true }));
  await Promise.all(batch);

  await addDoc(collection(db, COLLECTIONS.transactions), {
    uid: fromUid,
    type: "payment_sent",
    toUid,
    amount: value,
    note: note || "",
    status: "simulated",
    createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, COLLECTIONS.transactions), {
    uid: toUid,
    type: "payment_received",
    fromUid,
    amount: value,
    note: note || "",
    status: "simulated",
    createdAt: serverTimestamp(),
  });
}

export async function topUp(uid, amount, note) {
  const value = Number(amount);
  if (!value || value <= 0) throw new Error("Enter an amount greater than zero.");
  await setDoc(doc(db, COLLECTIONS.wallets, uid), { balance: increment(value), uid }, { merge: true });
  await addDoc(collection(db, COLLECTIONS.transactions), {
    uid,
    type: "topup",
    amount: value,
    note: note || "Simulated top-up",
    status: "simulated",
    createdAt: serverTimestamp(),
  });
}
