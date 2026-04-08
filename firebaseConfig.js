import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            "AIzaSyBYvfWE4hW9m51ureujf3ZRlelcPvAyv-Y",
  authDomain:        "aurora-hunter-418db.firebaseapp.com",
  projectId:         "aurora-hunter-418db",
  storageBucket:     "aurora-hunter-418db.firebasestorage.app",
  messagingSenderId: "735189013758",
  appId:             "1:735189013758:web:f6634d68f7c074797941af",
};

let app, auth, db, storage;

try {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  db      = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  // Auth gia inizializzato
  app     = getApps()[0];
  db      = getFirestore(app);
  storage = getStorage(app);
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

export { auth, db, storage };
export default app;
