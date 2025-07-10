// src/app/tabs/tabs.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page'; // Path is correct

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page), // Path is correct
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page), // Path is correct
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page), // Path is correct
      },
      {
        path: '', // This matches when you navigate to just /tabs
        redirectTo: 'tab1', // <--- CORRECTED: Redirects to 'tab1' relative to '/tabs'
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '', // This handles the initial redirect from root (e.g., '/')
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];