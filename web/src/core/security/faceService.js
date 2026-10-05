import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// ---------------------------------------------------------------------------
// Face recognition using @vladmandic/face-api (a maintained face-api.js fork).
//
// We store ONLY the 128-number face descriptor, never the photo. To verify we
// take a fresh descriptor and compare Euclidean distance: smaller = more alike.
// face-api is loaded dynamically so it only downloads on this page.
//
// Limitation: this runs fully in the browser with a fixed threshold. It is a
// demo-grade match, not a liveness-checked biometric system. Real deployments
// need a server + anti-spoofing.
// ---------------------------------------------------------------------------
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";
const MATCH_THRESHOLD = 0.5; // typical face-api threshold: < 0.5 => same person

let faceapiPromise = null;
let modelsLoaded = false;

async function getFaceApi() {
  if (!faceapiPromise) {
    faceapiPromise = import("@vladmandic/face-api");
  }
  return faceapiPromise;
}

export function faceRecognitionSupported() {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export async function loadModels() {
  if (modelsLoaded) return true;
  const faceapi = await getFaceApi();
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
  return true;
}

// Take one descriptor (avg of several samples if asked) from a <video> element.
export async function descriptorFromVideo(video) {
  const faceapi = await getFaceApi();
  const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  const result = await faceapi.detectSingleFace(video, opts).withFaceLandmarks().withFaceDescriptor();
  if (!result) return null;
  return Array.from(result.descriptor);
}

export function compareFace(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum) < MATCH_THRESHOLD;
}

export async function getFaceDescriptors(uid) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.faces), where("uid", "==", uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function registerFace(uid, descriptor) {
  return addDoc(collection(db, COLLECTIONS.faces), {
    uid,
    descriptor,
    createdAt: serverTimestamp(),
  });
}

export function removeFace(id) {
  return deleteDoc(doc(db, COLLECTIONS.faces, id));
}
