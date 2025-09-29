import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { LayoutComponent } from './layout/layout.component';
import { RouterOutlet } from '@angular/router';
import { TokenStorageService } from './auth/token-storage.service';
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LayoutComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'report-generator';
  private auth = inject(AuthService);
  private storage = inject(TokenStorageService);

  loggedIn$ = this.auth.isLoggedIn$();

  get isJwtExpired(): boolean {
    return this.storage.isJwtExpired();
  }

  ngAfterViewInit() {
    // ถ้า logged-in แล้ว (เช่น refresh หน้า) → โหลดโปรไฟล์ทันที
    if (this.storage.getAccessToken() && !this.isJwtExpired) {
      this.auth.fetchMe().subscribe();
    }

    // หลังจาก login สำเร็จ → เช็คหมดอายุอีกรอบ + ดึงโปรไฟล์
    this.auth
      .isLoggedIn$()
      .pipe(
        filter((v) => v === true),
        tap(() => {
          if (!this.isJwtExpired) {
            this.auth.fetchMe().subscribe();
          }
        })
      )
      .subscribe();
  }
}
