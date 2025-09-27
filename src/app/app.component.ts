import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { LayoutComponent } from './layout/layout.component';
import { RouterOutlet } from '@angular/router';
import { TokenStorageService } from './auth/token-storage.service';

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

  isJwtExpired = this.storage.isJwtExpired();
}
