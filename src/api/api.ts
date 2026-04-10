import { Medicine, Status, Alert } from '../types/medicine';

const STORAGE_KEY_MEDICINES = 'eldermed_medicines';
const STORAGE_KEY_MISSED = 'eldermed_missed';
const STORAGE_KEY_ALERTS = 'eldermed_alerts';

// Initialize default data if empty
if (!localStorage.getItem(STORAGE_KEY_MEDICINES)) {
  localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify([
    { id: '1', name: 'Aspirin', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', time_slot: 'morning' },
    { id: '2', name: 'Vitamin C', image: 'https://images.unsplash.com/photo-1550572017-edb731dd1da0?w=500&auto=format&fit=crop&q=60', time_slot: 'afternoon' }
  ]));
}

if (!localStorage.getItem(STORAGE_KEY_MISSED)) {
  localStorage.setItem(STORAGE_KEY_MISSED, JSON.stringify([]));
}

if (!localStorage.getItem(STORAGE_KEY_ALERTS)) {
  localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify([]));
}

// Communication channel for cross-tab real-time updates
const channel = new BroadcastChannel('eldermed_channel');

export const api = {
  getCurrentMedicines: async (): Promise<Medicine[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_MEDICINES) || '[]');
  },
  
  addMedicine: async (medicine: Medicine): Promise<{ success: boolean }> => {
    const meds = JSON.parse(localStorage.getItem(STORAGE_KEY_MEDICINES) || '[]');
    meds.push(medicine);
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(meds));
    channel.postMessage({ type: 'MEDICINES_UPDATED' });
    return { success: true };
  },

  updateMedicine: async (medicine: Medicine): Promise<{ success: boolean }> => {
    const meds = JSON.parse(localStorage.getItem(STORAGE_KEY_MEDICINES) || '[]');
    const index = meds.findIndex((m: Medicine) => m.id === medicine.id);
    if (index !== -1) {
      meds[index] = medicine;
      localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(meds));
      channel.postMessage({ type: 'MEDICINES_UPDATED' });
    }
    return { success: true };
  },

  deleteMedicine: async (id: string): Promise<{ success: boolean }> => {
    let meds = JSON.parse(localStorage.getItem(STORAGE_KEY_MEDICINES) || '[]');
    meds = meds.filter((m: Medicine) => m.id !== id);
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(meds));
    channel.postMessage({ type: 'MEDICINES_UPDATED' });
    return { success: true };
  },

  postMedicineStatus: async (status: Status): Promise<{ success: boolean }> => {
    if (status.status === 'missed') {
      const missed = JSON.parse(localStorage.getItem(STORAGE_KEY_MISSED) || '[]');
      const meds = JSON.parse(localStorage.getItem(STORAGE_KEY_MEDICINES) || '[]');
      const med = meds.find((m: Medicine) => m.name === status.name);
      if (med) {
        missed.push(med);
        localStorage.setItem(STORAGE_KEY_MISSED, JSON.stringify(missed));
      }
    }
    
    // Create an alert for taken or missed
    api.createAlert({
      timestamp: new Date().toISOString(),
      type: status.status === 'taken' ? 'info' : 'missed',
      message: `${status.name} was ${status.status}.`
    });

    channel.postMessage({ type: 'STATUS_UPDATED' });
    return { success: true };
  },

  getMissedMedicines: async (): Promise<Medicine[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_MISSED) || '[]');
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

  createAlert: (alert: Alert) => {
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEY_ALERTS) || '[]');
    alerts.unshift(alert); // Add to beginning
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    channel.postMessage({ type: 'NEW_ALERT', alert });
  },

  getAlerts: async (): Promise<Alert[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ALERTS) || '[]');
  },

  subscribe: (callback: (event: MessageEvent) => void) => {
    channel.addEventListener('message', callback);
    return () => channel.removeEventListener('message', callback);
  }
};
