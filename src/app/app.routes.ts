import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ReportsComponent } from './features/reports/reports.component';
import { PATH } from './shared/constants/paths.constant';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth.guard';
import { ExpenseComponent } from './features/expense/expense.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: PATH.HOME, component: HomeComponent, title: 'Home' },
      { path: PATH.REPORTS, component: ReportsComponent, title: 'Report' },
      { path: PATH.EXPENSE, loadComponent: () => import('./features/expense/expense.component').then(m => m.ExpenseComponent), title: 'Expense' },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];
