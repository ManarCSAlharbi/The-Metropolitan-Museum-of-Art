import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonText } from '@ionic/angular/standalone';
import { LikedArtworksService, LikedArtwork } from '../services/liked-artworks/liked-artworks.service';
import { CardComponent } from '../componants/card/card.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Artwork } from '../services/api/api.service';

@Component({
  selector: 'app-liked-artworks', // Changed from app-tab3 to app-liked-artworks
  templateUrl: 'liked-artworks.page.html',
  styleUrls: ['liked-artworks.page.scss'],
  imports: [
    IonText, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    CardComponent, 
    CommonModule
  ],
})
export class LikedArtworksPage implements OnInit, OnDestroy { // Changed from Tab3Page to LikedArtworksPage
  likedArtworks: Artwork[] = [];
  private subscription?: Subscription;

  constructor(private likedArtworksService: LikedArtworksService) {}

  ngOnInit() {
    // Subscribe to liked artworks updates for real-time synchronization
    this.subscription = this.likedArtworksService.getLikedArtworks().subscribe(
      (artworks) => {
        this.likedArtworks = artworks;
      }
    );
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Optimize rendering performance for large lists
  trackByObjectId(index: number, artwork: Artwork): number {
    return artwork.objectID;
  }
}
