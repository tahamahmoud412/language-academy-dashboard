import { Routes } from '@angular/router';

export const aboutUsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/about-us-list/about-us-list').then(m => m.AboutUsList)
  },
  
];