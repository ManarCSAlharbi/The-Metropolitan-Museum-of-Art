import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService, Artwork } from '../services/api/api.service';
import { CardComponent } from '../componants/card/card.component';

@Component({
  selector: 'app-home', // Changed from app-tab1 to app-home
  standalone: true,
  imports: [IonicModule, CommonModule, CardComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit { // Changed from Tab1Page to HomePage
  
  artworks: Artwork[] = [];
  maxArtworks = 20;
  batchSize = 5;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInitialArtworks();
  }

  // Load initial batch of artworks when component initializes
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
        console.error('Error loading more artworks', err);
        infiniteScroll.complete();
      }
    });
  }

  // Close modal when backdrop is clicked
  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal.dismiss();
  }
}