import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage), // Updated to HomePage
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../search/search.page').then((m) => m.SearchPage), // Updated to SearchPage
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../liked-artworks/liked-artworks.page').then((m) => m.LikedArtworksPage), // Updated to LikedArtworksPage
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];