import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {
  Observable,
  catchError,
  filter,
  finalize,
  switchMap,
  throwError,
  Subject,
  take,
} from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new Subject<boolean>();

  constructor(
    private storage: TokenStorageService,
    private auth: AuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.storage.getAccessToken();
    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(cloned).pipe(
      catchError((err: any) => {
        // อย่าพยายาม refresh กับ endpoints เหล่านี้ เพื่อกันลูป
        const isAuthEndpoint = /\/auth\/(login|register|refresh)/.test(req.url);
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          !isAuthEndpoint
        ) {
          return this.handle401(cloned, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject = new Subject<boolean>();

      return this.auth.refreshTokens().pipe(
        switchMap((tokens) => {
          this.isRefreshing = false;
          this.refreshSubject.next(true);
          this.refreshSubject.complete();
          if (tokens?.accessToken) {
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            return next.handle(newReq);
          }
          // ไม่มี token ใหม่ → ปล่อย error 401 เดิม
          return next.handle(req);
        }),
        catchError((e) => {
          this.isRefreshing = false;
          this.refreshSubject.next(false);
          this.refreshSubject.complete();
          // เคลียร์สถานะ + ส่งต่อ error
          this.auth.logout().subscribe({ error: () => {} });
          return throwError(() => e);
        }),
        finalize(() => (this.isRefreshing = false))
      );
    }

    // ถ้ากำลัง refresh อยู่ รอให้จบก่อน
    return this.refreshSubject.pipe(
      filter((done) => done !== undefined),
      take(1),
      switchMap((ok) => {
        const access = this.storage.getAccessToken();
        const newReq = access
          ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
          : req;
        return next.handle(newReq);
      })
    );
  }
}
