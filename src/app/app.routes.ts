import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home', pathMatch: 'full'
  },

  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'courses',
        loadChildren: () => import('./features/courses/course.routes').then((m) => m.coursesRoutes),
      },
      {
        path: 'services',
        loadChildren: () => import('./features/content/services/service.routes').then((m) => m.servicesRoutes),
      },
      {
        path: 'faq',
        loadChildren: () => import('./features/content/faq/faq.routes').then((m) => m.faqRoutes),
      },
      {
        path: 'events',
        loadChildren: () => import('./features/who-we-are/events/events.routes').then((m) => m.eventsRoutes),
      }
      ,
      {
        path: 'about-us',
        loadChildren: () => import('./features/who-we-are/about-us/about-us.routes').then((m) => m.aboutUsRoutes),
      }
    ],
  },
  {
    path: '**',
    redirectTo: '/home', pathMatch: 'full'
  },

];
