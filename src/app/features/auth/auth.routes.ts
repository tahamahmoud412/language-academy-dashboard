import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'signin',
        pathMatch: 'full'
    },
    {
        path: 'signin',
        loadComponent: () => import('./components/sigin/sigin').then(c => c.Sigin)
    },
    {
        path: 'signup',
        loadComponent: () => import('./components/signup/signup').then(c => c.Signup)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./components/forgot-password/forgot-password').then(c => c.ForgotPassword)
    }
];
