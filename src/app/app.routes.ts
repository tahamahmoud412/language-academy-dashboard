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
        loadComponent: () => import('./features/services/components/service-list/service-list').then((m) => m.ServiceList),
      }


    ],
  },
  {
    path: '**',
    redirectTo: '/home', pathMatch: 'full'
  },

];
