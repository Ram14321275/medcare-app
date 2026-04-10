import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Medicine, Status, Alert } from '../types/medicine';

const firebaseConfig = {
  apiKey: "AIzaSyDSCCgIB--MDbzoET0zzCfUPfv3d25XKg8",
  authDomain: "eldermed-db.firebaseapp.com",
  projectId: "eldermed-db",
  storageBucket: "eldermed-db.firebasestorage.app",
  messagingSenderId: "444626262722",
  appId: "1:444626262722:web:489a329012cfd05b67795b",
  measurementId: "G-SSY77CXL8K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use an EventTarget to mimic the old local BroadcastChannel behavior for seamless React compatibility
const eventBus = new EventTarget();

// 🚀 REAL-TIME CLOUD LISTENERS: these trigger UI updates across ALL connected devices instantly!
onSnapshot(collection(db, 'medicines'), () => {
    eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'MEDICINES_UPDATED' } }));
});

onSnapshot(collection(db, 'alerts'), () => {
    eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'NEW_ALERT' } }));
});

onSnapshot(collection(db, 'missed'), () => {
    eventBus.dispatchEvent(new MessageEvent('message', { data: { type: 'STATUS_UPDATED' } }));
});


export const api = {
  getCurrentMedicines: async (): Promise<Medicine[]> => {
    const snap = await getDocs(collection(db, 'medicines'));
    const meds: Medicine[] = [];
    snap.forEach(d => meds.push(d.data() as Medicine));
    return meds;
  },
  
  addMedicine: async (medicine: Medicine): Promise<{ success: boolean }> => {
    await setDoc(doc(db, 'medicines', medicine.id), medicine);
    return { success: true };
  },

  updateMedicine: async (medicine: Medicine): Promise<{ success: boolean }> => {
    await setDoc(doc(db, 'medicines', medicine.id), medicine);
    return { success: true };
  },

  deleteMedicine: async (id: string): Promise<{ success: boolean }> => {
    await deleteDoc(doc(db, 'medicines', id));
    return { success: true };
  },

  postMedicineStatus: async (status: Status): Promise<{ success: boolean }> => {
    if (status.status === 'missed') {
      const snap = await getDocs(collection(db, 'medicines'));
      let med: any = null;
      snap.forEach(d => {
         if (d.data().name === status.name) {
             med = d.data();
         }
      });
      if (med) {
        await addDoc(collection(db, 'missed'), med);
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
    const snap = await getDocs(collection(db, 'missed'));
    const meds: Medicine[] = [];
    snap.forEach(d => meds.push(d.data() as Medicine));
    return meds;
  },

  postAlert: async (message: string = 'SOS Alert Triggered!', photo?: string): Promise<{ success: boolean }> => {
    api.createAlert({
      timestamp: new Date().toISOString(),
      type: 'emergency',
      message,
      photo
    });
    return { success: true };
  },

  createAlert: async (alert: Alert) => {
    await addDoc(collection(db, 'alerts'), alert);
  },

  getAlerts: async (): Promise<Alert[]> => {
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const alerts: Alert[] = [];
    snap.forEach(d => alerts.push(d.data() as Alert));
    return alerts;
  },

  subscribe: (callback: (event: MessageEvent) => void) => {
    const handler = callback as EventListener;
    eventBus.addEventListener('message', handler);
    return () => eventBus.removeEventListener('message', handler);
  }
};
