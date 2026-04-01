import { Routes } from '@angular/router';

export const examsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./exams-list/exams-list')
        .then(m => m.ExamsList)
  },
  {
    path: 'create',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'enrollments',
    loadComponent: () =>
      import('./exam-enrollments/exam-enrollments')
        .then(m => m.ExamEnrollments)
  },
];
