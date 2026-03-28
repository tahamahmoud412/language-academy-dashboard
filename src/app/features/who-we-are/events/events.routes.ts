import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/event-list/event-list').then(m => m.EventList)
  },
  
];