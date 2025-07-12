import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonText } from '@ionic/angular/standalone';
import { LikedArtworksService, LikedArtwork } from '../services/liked-artworks/liked-artworks.service';
import { CardComponent } from '../componants/card/card.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
export class Tab3Page implements OnInit, OnDestroy {
  likedArtworks: LikedArtwork[] = [];
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

  // Refresh liked artworks when tab is entered
  ionViewWillEnter() {
    // This ensures the list is current when user switches to this tab
  }

  // Optimize rendering performance for large lists
  trackByObjectId(index: number, artwork: LikedArtwork): number {
    return artwork.objectID;
  }
}
