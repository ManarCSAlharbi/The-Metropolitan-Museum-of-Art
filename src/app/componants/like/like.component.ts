import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { LikedArtworksService } from '../../services/liked-artworks/liked-artworks.service';
import { ApiService } from '../../services/api/api.service';

addIcons({ heart, heartOutline });

@Component({
  selector: 'app-like-button',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss']
})
export class LikeComponent implements OnInit {
  @Input() initialCount = 0;
  @Input() cardData!: any;

  liked = false;
  likeCount = 0;

  constructor(
    private likedArtworksService: LikedArtworksService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.likeCount = this.initialCount;
    this.liked = this.likedArtworksService.isArtworkLiked(this.cardData.objectID);
    this.loadLikeCount();
  }

  // Load current like count from API
  private loadLikeCount() {
    if (this.cardData?.objectID) {
      this.apiService.getLikes(this.cardData.objectID.toString()).subscribe({
        next: (likeData) => {
          this.likeCount = likeData.likes || 0;
        },
        error: (error) => {
          // Keep the initial count if API fails
        }
      });
    }
  }

  // Toggle like state and update both local storage and API
  toggleLike() {
    this.liked = !this.liked;
    
    if (this.liked) {
      // Add to local liked artworks
      this.likedArtworksService.addLikedArtwork(this.cardData);
      
      // Post like to API
      this.apiService.postLike({
        item_id: this.cardData.objectID.toString(),
        likes: this.likeCount + 1
      }).subscribe({
        next: (response) => {
          this.likeCount = response.likes;
        },
        error: (error) => {
          // Optimistically update like count
          this.likeCount += 1;
        }
      });
    } else {
      // Remove from local liked artworks
      this.likedArtworksService.removeLikedArtwork(this.cardData.objectID);
      
      // Post updated like to API (decrement)
      this.apiService.postLike({
        item_id: this.cardData.objectID.toString(),
        likes: Math.max(0, this.likeCount - 1)
      }).subscribe({
        next: (response) => {
          this.likeCount = response.likes;
        },
        error: (error) => {
          // Optimistically update like count
          this.likeCount = Math.max(0, this.likeCount - 1);
        }
      });
    }
  }
}
