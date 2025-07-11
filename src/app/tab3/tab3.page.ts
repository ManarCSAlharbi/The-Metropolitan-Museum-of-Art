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
    // Subscribe to liked artworks updates
    this.subscription = this.likedArtworksService.getLikedArtworks().subscribe(
      (artworks) => {
        this.likedArtworks = artworks;
        console.log('Liked artworks updated in Tab3:', this.likedArtworks.length);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    // This will be called every time the tab is entered
    console.log('Tab3 entered, liked artworks count:', this.likedArtworks.length);
  }

  // TrackBy function for better performance
  trackByObjectId(index: number, artwork: LikedArtwork): number {
    return artwork.objectID;
  }
}
