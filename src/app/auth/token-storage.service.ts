import { Injectable } from '@angular/core';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken'; // ⚠️ dev เท่านั้น แนะนำใช้ cookie บนโปรดักชัน

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private accessToken: string | null = null;

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    this.accessToken = localStorage.getItem(ACCESS_KEY);
    return this.accessToken;
  }

  setTokens(access: string, refresh?: string) {
    this.accessToken = access;
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  clear() {
    this.accessToken = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  isJwtExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const [, payload] = token.split('.');
      const { exp } = JSON.parse(atob(payload));
      return !exp || Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }
}
