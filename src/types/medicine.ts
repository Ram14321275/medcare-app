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
  timestamp: string;
  type: string;
  message: string;
  photo?: string;
}
