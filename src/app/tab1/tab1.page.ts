import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService, Artwork } from '../services/api/api.service';
import { CardComponent } from '../componants/card/card.component';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonicModule, CommonModule, CardComponent],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page implements OnInit {
  
artworks: Artwork[] = [];
maxArtworks = 20;  // lower total cap
  batchSize = 5;     // smaller batch

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInitialArtworks();
  }

private loadInitialArtworks() {
    this.apiService.getArtworks(this.batchSize).subscribe({
      next: list => this.artworks = list,
      error: err => console.error('Error loading artworks', err)
    });
  }

  /**
   * Infinite scroll handler; uses any for event target since IonInfiniteScroll type may not be found.
   */
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

  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal.dismiss();
  }
}