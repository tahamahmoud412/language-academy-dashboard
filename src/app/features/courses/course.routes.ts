import { Routes } from '@angular/router';

export const coursesRoutes: Routes = [
  {
    path: '',
    redirectTo: '/list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/course-list/courses')
        .then(m => m.Courses)
  },
];