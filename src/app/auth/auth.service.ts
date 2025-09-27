import { Injectable } from '@angular/core';
import { AuthApi } from 'app/api';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Tokens, UserProfile } from './models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn$ = new BehaviorSubject<boolean>(
    !!this.storage.getAccessToken()
  );
  private me$ = new BehaviorSubject<UserProfile | null>(null);

  constructor(private authApi: AuthApi, private storage: TokenStorageService) {}

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }
  meStream$(): Observable<UserProfile | null> {
    return this.me$.asObservable();
  }

  login(email: string, password: string) {
    return this.authApi.authControllerLogin({ email, password }).pipe(
      tap((t) => this.storage.setTokens(t.accessToken, t.refreshToken)),
      tap(() => this.loggedIn$.next(true)),
      tap(() => this.fetchMe().subscribe())
    );
  }

  register(email: string, password: string) {
    return this.authApi.authControllerRegister({ email, password }).pipe(
      tap((t) => this.storage.setTokens(t.accessToken, t.refreshToken)),
      tap(() => this.loggedIn$.next(true)),
      tap(() => this.fetchMe().subscribe())
    );
  }

  fetchMe() {
    return this.authApi.authControllerMe().pipe(tap((u) => this.me$.next(u)));
  }

  logout() {
    const req$ = this.authApi.authControllerLogout();
    return req$.pipe(
      tap(() => this.storage.clear()),
      tap(() => this.loggedIn$.next(false)),
      tap(() => this.me$.next(null))
    );
  }

  // เรียกเมื่อ 401
  refreshTokens(): Observable<Tokens | null> {
    const rt = this.storage.getRefreshToken();
    if (!rt) return of(null);

    // ใส่ค่า credential ให้กับ security scheme ชื่อ 'refresh-token'
    this.authApi.configuration.credentials['refresh-token'] = rt;

    return this.authApi
      .authControllerRefresh(undefined, false, {
        transferCache: false,
      })
      .pipe(
        tap((t: any) => this.storage.setTokens(t.accessToken, t.refreshToken))
      );
  }
}
