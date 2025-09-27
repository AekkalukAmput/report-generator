export interface Tokens {
  accessToken: string;
  refreshToken: string; // dev only (ถ้าใช้ cookie-based จะไม่ต้องเก็บ)
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}
