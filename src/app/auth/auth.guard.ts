import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

function isJwtExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return !exp || Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private storage: TokenStorageService, private router: Router) {}
  canActivate(): boolean {
    const t = this.storage.getAccessToken();
    if (t && !isJwtExpired(t)) return true;
    this.router.navigateByUrl('/login');
    return false;
  }
}
