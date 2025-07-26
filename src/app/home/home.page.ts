import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Artwork } from '../services/api/api.service';
import { CardComponent } from '../componants/card/card.component';
import { IonButton, IonText, IonInfiniteScroll, IonInfiniteScrollContent, IonContent, IonToolbar, IonHeader, IonTitle, IonCard, IonCardHeader, IonSkeletonText, IonCardContent, IonTabButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonButton,
    IonCardContent,
    IonSkeletonText,
    IonCardHeader,
    IonCard,
    IonTitle, 
    IonHeader,
    IonToolbar,
    IonContent,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    CommonModule,
    CardComponent,
    IonText
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  artworks: Artwork[] = [];
  maxArtworks = 20;
  batchSize = 5;
  error: string | null = null;
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInitialArtworks();
  }

  // Load initial batch of artworks
  private loadInitialArtworks() {
    this.apiService.getArtworks(this.batchSize).subscribe({
      next: list => this.artworks = list,
      error: err => console.error('Error loading artworks', err)
    });
  }

  // Handle infinite scroll to load more artworks
  loadMore(event: any) {
    const infiniteScroll = event.target as any;
    const remaining = this.maxArtworks - this.artworks.length;
    
    if (remaining <= 0) {
      infiniteScroll.complete();
      infiniteScroll.disabled = true; 
      return;
    }
    
    const size = Math.min(this.batchSize, remaining);
    this.apiService.getArtworks(size).subscribe({
      next: list => {
        this.artworks.push(...list);
        infiniteScroll.complete();
        if (this.artworks.length >= this.maxArtworks) {
          infiniteScroll.disabled = true;
        }
      },
      error: err => {
        console.log('Error loading more artworks', err);
        infiniteScroll.complete();
      }
    });
  }

  // Close modal when backdrop is clicked
  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal?.dismiss();
  }

  onRetry() {
    this.loadInitialArtworks();
  }
}