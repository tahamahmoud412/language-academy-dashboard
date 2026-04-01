import { Routes } from '@angular/router';

export const servicesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/service-list/service-list').then(m => m.ServiceList)
  },
  
];