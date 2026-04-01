import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { guestGuard } from './core/guard/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home', pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.routes),
    canActivate: [guestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'courses',
        loadChildren: () => import('./features/courses/new-course/course.routes').then((m) => m.coursesRoutes),
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/courses/categories/categories.routes').then((m) => m.categoriesRoutes),
      },
      {
        path: 'enrollments',
        loadChildren: () => import('./features/courses/enrollments/enrollments.routes').then((m) => m.enrollmentsRoutes),
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
      },
      {
        path: 'exams',
        loadChildren: () => import('./features/exams/exams.routes').then((m) => m.examsRoutes),
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
