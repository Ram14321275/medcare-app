import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc, addDoc, onSnapshot, query, orderBy, Unsubscribe } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Medicine, Status, Alert, ElderProfile } from '../types/medicine';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const eventBus = new EventTarget();
let currentUser: User | null = null;

let unsubMedicines: Unsubscribe | null = null;
let unsubAlerts: Unsubscribe | null = null;
let unsubMissed: Unsubscribe | null = null;
let unsubProfile: Unsubscribe | null = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (unsubMedicines) unsubMedicines();
    if (unsubAlerts) unsubAlerts();
    if (unsubMissed) unsubMissed();
    if (unsubProfile) unsubProfile();

    if (user) {
        unsubMedicines = onSnapshot(collection(db, `users/${user.uid}/medicines`), () => {
            eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'MEDICINES_UPDATED' } }));
        });
        unsubAlerts = onSnapshot(collection(db, `users/${user.uid}/alerts`), () => {
            eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'NEW_ALERT' } }));
        });
        unsubMissed = onSnapshot(collection(db, `users/${user.uid}/missed`), () => {
            eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'STATUS_UPDATED' } }));
        });
        unsubProfile = onSnapshot(doc(db, `users/${user.uid}/profile/details`), () => {
            eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'PROFILE_UPDATED' } }));
        });
    }
});

export const api = {
  getElderProfile: async (): Promise<ElderProfile> => {
    if (!currentUser) return {} as ElderProfile;
    const snap = await getDoc(doc(db, `users/${currentUser.uid}/profile/details`));
    if (snap.exists()) {
      return snap.data() as ElderProfile;
    }
    return {
      name: "Elder Name",
      age: "0",
      bloodType: "Unknown",
      allergies: "None",
      emergencyContact: "Not Set"
    };
  },

  updateElderProfile: async (profile: ElderProfile): Promise<void> => {
    if (!currentUser) return;
    await setDoc(doc(db, `users/${currentUser.uid}/profile/details`), profile);
  },

  getCurrentMedicines: async (): Promise<Medicine[]> => {
    if (!currentUser) return [];
    const snap = await getDocs(collection(db, `users/${currentUser.uid}/medicines`));
    const meds: Medicine[] = [];
    snap.forEach(d => meds.push(d.data() as Medicine));
    return meds;
  },
  
  addMedicine: async (medicine: Medicine): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };
    await setDoc(doc(db, `users/${currentUser.uid}/medicines`, medicine.id), medicine);
    return { success: true };
  },

  updateMedicine: async (medicine: Medicine): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };
    await setDoc(doc(db, `users/${currentUser.uid}/medicines`, medicine.id), medicine);
    return { success: true };
  },

  deleteMedicine: async (id: string): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };
    await deleteDoc(doc(db, `users/${currentUser.uid}/medicines`, id));
    return { success: true };
  },

  postMedicineStatus: async (status: Status): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };
    if (status.status === 'missed') {
      const snap = await getDocs(collection(db, `users/${currentUser.uid}/medicines`));
      let med: any = null;
      snap.forEach(d => {
         if (d.data().name === status.name) {
             med = d.data();
         }
      });
      if (med) {
        await addDoc(collection(db, `users/${currentUser.uid}/missed`), med);
      }
    }
    
    api.createAlert({
      timestamp: new Date().toISOString(),
      type: status.status === 'taken' ? 'info' : 'missed',
      message: `${status.name} was ${status.status}.`
    });

    return { success: true };
  },

  getMissedMedicines: async (): Promise<Medicine[]> => {
    if (!currentUser) return [];
    const snap = await getDocs(collection(db, `users/${currentUser.uid}/missed`));
    const meds: Medicine[] = [];
    snap.forEach(d => meds.push(d.data() as Medicine));
    return meds;
  },

  postAlert: async (message: string = 'SOS Alert Triggered!', photo?: string): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };
    await api.createAlert({
      timestamp: new Date().toISOString(),
      type: 'emergency',
      message,
      photo
    });
    return { success: true };
  },

  createAlert: async (alert: Alert) => {
    if (!currentUser) return;
    await addDoc(collection(db, `users/${currentUser.uid}/alerts`), alert);
  },

  getAlerts: async (): Promise<Alert[]> => {
    if (!currentUser) return [];
    const q = query(collection(db, `users/${currentUser.uid}/alerts`), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const alerts: Alert[] = [];
    snap.forEach(d => alerts.push({ id: d.id, ...(d.data() as Alert) }));
    return alerts;
  },

  deleteAlert: async (id: string): Promise<void> => {
    if (!currentUser) return;
    await deleteDoc(doc(db, `users/${currentUser.uid}/alerts`, id));
  },

  removeAlertPhoto: async (id: string): Promise<void> => {
    if (!currentUser) return;
    await setDoc(doc(db, `users/${currentUser.uid}/alerts`, id), { photo: null }, { merge: true });
  },

  subscribe: (callback: (event: MessageEvent) => void) => {
    const handler = callback as EventListener;
    eventBus.addEventListener('message', handler);
    return () => eventBus.removeEventListener('message', handler);
  }
};
