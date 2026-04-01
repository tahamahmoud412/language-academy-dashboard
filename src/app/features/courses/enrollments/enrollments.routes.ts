import { Routes } from '@angular/router';

export const enrollmentsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/enrollments-list/enrollments-list').then(m => m.EnrollmentsList) 
    }

];