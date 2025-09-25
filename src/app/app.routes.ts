import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ReportsComponent } from './features/reports/reports.component';
import { PATH } from './shared/constants/paths.constant';

export const routes: Routes = [
    {
        path: '',
        canActivate: [],
        children: [
            { path: PATH.HOME, component: HomeComponent, title: 'Home' },
            { path: PATH.REPORTS, component: ReportsComponent, title: 'Report' },
            { path: '**', redirectTo: '' },
        ],
    },
];
