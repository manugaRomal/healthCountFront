export interface HealthData {
  hId?: number;
  userEmail: string;
  date: string;
  steps: number | null;
  calories: number | null;
  isManual: boolean;
  uploadTimestamp: string;
  imgUrl?: string; // Azure blob URL for the uploaded image
  imgHash?: string; // Image hash for duplicate detection
}

export interface UploadProgress {
  uploadId: number;
  steps: number;
  calories: number;
  uploadedAt: string;
}

export interface TotalStats {
  totalSteps: number;
  totalCalories: number;
  totalUploads: number;
  averageSteps: number;
  averageCalories: number;
}
