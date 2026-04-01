import { Routes } from '@angular/router';

export const categoriesRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/categories-list/categories-list').then(m => m.CategoriesList)
    }
];