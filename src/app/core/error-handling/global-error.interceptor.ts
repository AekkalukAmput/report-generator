import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';
import { normalizeApiError } from './api-error';

@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private errors: ErrorService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        const apiErr = normalizeApiError(err);
        const status = apiErr.status;

        // ข้าม endpoint ที่เป็น auth โดยปล่อยให้แต่ละเคสจัดการเอง
        const isAuthEndpoint = /\/auth\//.test(req.url);

        switch (status) {
          case 0: // network error / CORS ถูกบล็อก / server down
            this.errors.showToast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            break;
          case 400:
            // bad request (อาจเป็น validation รวม) → ให้หน้าปลายทาง handle เพิ่มเติม
            this.errors.emit(apiErr);
            break;
          case 401:
            // มาถึงนี่ แปลว่า AuthInterceptor รีเฟรชไม่สำเร็จแล้ว
            if (!isAuthEndpoint) {
              this.errors.showToast('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: this.router.url },
              });
            }
            break;
          case 403:
            this.errors.showToast('คุณไม่มีสิทธิ์เข้าถึงทรัพยากรนี้');
            this.router.navigate(['/forbidden']); // สร้างหน้าตามต้องการ
            break;
          case 404:
            this.errors.showToast('ไม่พบข้อมูลที่ร้องขอ');
            break;
          case 422:
            // validation errors รายฟิลด์ → ปล่อยให้คอมโพเนนต์ปลายทาง map เข้าฟอร์ม
            this.errors.emit(apiErr);
            break;
          default:
            // 5xx หรืออื่น ๆ
            this.errors.showToast(
              apiErr.detail || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์'
            );
            break;
        }

        return throwError(() => apiErr);
      })
    );
  }
}
