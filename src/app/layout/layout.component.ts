import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PATH } from '../shared/constants/paths.constant';
import { CommonModule } from '@angular/common';
import { RouterService } from '@core/services/router/router.service';
import { AuthService } from 'app/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  listMenu = [
    { name: 'Home', path: PATH.HOME },
    { name: 'Reports', path: PATH.REPORTS },
    { name: 'Expense', path: PATH.EXPENSE },
  ];

  constructor(
    private routerService: RouterService,
    private authService: AuthService
  ) { }

  navigateTo(path: string): void {
    this.routerService.navigateTo(path);
  }

  checkActive(path: string): boolean {
    return location.pathname === `/${path}`;
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.routerService.navigateTo(PATH.LOGIN);
      },
      error: (err) => {
        console.error('Logout error', err);
      }
    });
  }
}
