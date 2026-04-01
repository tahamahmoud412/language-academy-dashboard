import { Routes } from '@angular/router';

export const faqRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/faq-list/faq-list').then(m => m.FaqList)
  }
];