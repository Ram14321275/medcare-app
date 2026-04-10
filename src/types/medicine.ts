export interface Medicine {
  id: string;
  name: string;
  image: string;
  time_slot: "morning" | "afternoon" | "night";
  instruction?: string;
  animation_type?: "tablet" | "capsule" | "syrup";
}

export interface Status {
  name: string;
  status: "taken" | "missed";
}

export interface Alert {
  id?: string;
  timestamp: string;
  type: string;
  message: string;
  photo?: string | null;
}

export interface ElderProfile {
  name: string;
  age: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
}
