import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'departments',
    loadComponent: () => import('./departments/departments/departments.page').then( m => m.DepartmentsPage)
  },
  {
    path: 'department-objects/:id',
    loadComponent: () => import('./department-objects/department-objects/department-objects.page').then( m => m.DepartmentObjectsPage)
  },
];
