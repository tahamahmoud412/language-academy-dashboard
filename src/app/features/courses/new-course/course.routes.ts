import { Routes } from '@angular/router';

export const coursesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/course-list/courses')
        .then(m => m.Courses)
  },
];