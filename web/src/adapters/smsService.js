import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";

// SIMULATED: saves the message to sms_outbox instead of sending it.
// Capstone: replace the body with a call to your server that uses a real SMS provider.
export async function sendSms(to, message) {
  await addDoc(collection(db, COLLECTIONS.smsOutbox), {
    to,
    message,
    status: "simulated",
    createdAt: serverTimestamp(),
  });
}
