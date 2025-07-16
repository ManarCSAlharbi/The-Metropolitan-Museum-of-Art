import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
  IonContent, IonButtons, IonInput, IonTextarea, IonList, IonItem, IonLabel, IonTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, heart, heartOutline } from 'ionicons/icons';
import { ApiService, Comment, Like } from '../../services/api/api.service';
import { LikedArtworksService } from '../../services/liked-artworks/liked-artworks.service';
import { LikeCountService } from '../../services/like-count/like-count.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    IonList, IonTextarea, IonInput, IonButtons,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
    IonContent, IonItem, IonLabel, IonTitle,
    CommonModule, FormsModule
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
  
  @Input() artwork!: any;
  @Input() showRemoveButton: boolean = false; // Show remove button in Tab3
  @ViewChild(IonModal) modal?: IonModal;

  comments: Comment[] = [];

// 1L - State Storage and Initialization for lilkes
  likes: number = 0;
  isLiked: boolean = false;

  newComment = {
    username: '',
    comment: ''
  };

  // Subscriptions for reactive updates
  private likedArtworksSubscription?: Subscription;
  private likeCountSubscription?: Subscription;

  // 1c- Two boolean flags control the visual feedback:
  public justSubmitted: boolean = false; // Prevents validation errors after form submission
  public isResetState: boolean = true; // Tracks if form is in reset/default state

  // 1c- Form validation state
  // state object to track the validity of each field
  validation = {
    username: {
      isValid: true,
      errorMessage: ''
    },
    comment: {
      isValid: true,
      errorMessage: ''
    }
  };

  constructor(
    private apiService: ApiService, 
    private likedArtworksService: LikedArtworksService,
    private likeCountService: LikeCountService,
    private alertController: AlertController,
    private http: HttpClient
  ) {
    addIcons({ close, heart, heartOutline });
  }

  ngOnInit() {
    //1L - Initialize like state from local storage
    if (this.artwork?.objectID) {
      this.isLiked = this.likedArtworksService.isArtworkLiked(this.artwork.objectID);
      
      // Use cached like count if available
      if (this.likeCountService.hasLikeCount(this.artwork.objectID)) {
        this.likes = this.likeCountService.getLikeCount(this.artwork.objectID);
      }
    }
    
    // Load fresh data from API
    this.loadLikes();
    
    // Load comments for this artwork
    this.loadComments();
    
    // Test the specific API endpoint for debugging
    this.testApiEndpoint();
    
    // Subscribe to liked artworks changes for real-time updates
    this.likedArtworksSubscription = this.likedArtworksService.getLikedArtworks().subscribe(
      (likedArtworks) => {
        if (this.artwork?.objectID) {
          this.isLiked = likedArtworks.some(artwork => artwork.objectID === this.artwork.objectID);
        }
      }
    );

    // Subscribe to like count changes for real-time synchronization
    this.likeCountSubscription = this.likeCountService.getLikeCounts().subscribe(
      (likeCounts) => {
        if (this.artwork?.objectID && likeCounts.has(this.artwork.objectID)) {
          const newCount = likeCounts.get(this.artwork.objectID)!;
          if (this.likes !== newCount) {
            this.likes = newCount;
          }
        }
      }
    );
  }

  // Clean up subscriptions to avoid memory leaks
  ngOnDestroy() {
    if (this.likedArtworksSubscription) {
      this.likedArtworksSubscription.unsubscribe();
    }
    if (this.likeCountSubscription) {
      this.likeCountSubscription.unsubscribe();
    }
  }

  // Load comments for the artwork
  loadComments() {
  if (this.artwork?.objectID) {
    console.log(`Loading comments for artwork: ${this.artwork?.title || 'Unknown Title'} (ID: ${this.artwork.objectID})`);
    
    this.apiService.getComments(this.artwork.objectID.toString()).subscribe({
      next: (comments) => {
        console.log(`Comments received for ${this.artwork?.title || 'Unknown Title'}:`, comments);
        
        // Ensure we get all comments, not just the first 10
        this.comments = Array.isArray(comments) ? comments : [];
        
        // Sort comments by creation date (newest first) to ensure proper display order
        this.comments.sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime());
        
        console.log(`✅ ${this.comments.length} comments loaded for artwork: ${this.artwork?.title}`);
        
        if (this.comments.length === 0) {
          console.log(`ℹ️ No comments found for artwork: ${this.artwork?.title}`);
        }
      },
      error: (error) => {
        // Handle different error types gracefully
        if (error.status === 400) {
          console.log(`ℹ️ No comments available for artwork: ${this.artwork?.title} (ID: ${this.artwork.objectID})`);
        } else {
          console.error(`❌ Error loading comments for artwork ${this.artwork?.title || 'Unknown Title'}:`, error);
        }
        this.comments = [];
      }
    });
  } else {
    console.log('❌ No artwork ID available for loading comments');
    this.comments = [];
  }
}




  // Load like count from API and synchronize services
  loadLikes() {
    if (this.artwork?.objectID) {
      this.apiService.getLikes(this.artwork.objectID.toString()).subscribe({
        next: (likeData) => {
          const newLikeCount = likeData.likes || 0;
          this.likes = newLikeCount;
          
          this.likeCountService.updateLikeCount(this.artwork.objectID, newLikeCount);
          this.isLiked = this.likedArtworksService.isArtworkLiked(this.artwork.objectID);
        },
        error: (error) => {
          console.error('Error loading likes:', error);
          this.likes = 0;
          this.isLiked = this.likedArtworksService.isArtworkLiked(this.artwork.objectID);
        }
      });
    }
  }

  // Save user's like preference to localStorage for persistence
  private saveUserLike(itemId: string, isLiked: boolean) {
    const likedItems = JSON.parse(localStorage.getItem('likedArtworks') || '[]');
    if (isLiked && !likedItems.includes(itemId)) {
      likedItems.push(itemId);
    } else if (!isLiked && likedItems.includes(itemId)) {
      const index = likedItems.indexOf(itemId);
      likedItems.splice(index, 1);
    }
    localStorage.setItem('likedArtworks', JSON.stringify(likedItems));
  }

  // 4c- Real-time Validation: Validate form input as user types
  onUserInput() {
    // If just submitted, skip validation to avoid errors
    if (this.justSubmitted) {
      return;
    }
    
    if (this.newComment.username.trim().length > 0) {
      this.validateUsername();
    }
    
    if (this.newComment.comment.trim().length > 0) {
      this.validateComment();
    }
  }

  // 3c- Reset validation state when user starts typing after submission
  onUserStartsTyping() {
    // If just submitted, don't allow typing yet (keep gray state)
    if (this.justSubmitted) {
      return;
    }
    
    // User is now typing, exit initial state
    this.isResetState = false;
    
    // Start real-time validation
    this.onUserInput();
  }

  validateUsername() {
    const username = this.newComment.username.trim();
    
    if (!username) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name is required';
    } else if (username.length < 2) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name must be at least 2 characters long';
    } else if (username.length > 20) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name cannot exceed 20 characters';
    } else if (!/^[a-zA-Z0-9\s._-]+$/.test(username)) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name can only contain letters, numbers, spaces, dots, hyphens, and underscores';
    } else {
      this.validation.username.isValid = true;
      this.validation.username.errorMessage = '';
    }
  }

  validateComment() {
    const comment = this.newComment.comment.trim();
    
    if (!comment) {
      this.validation.comment.isValid = false;
      this.validation.comment.errorMessage = 'Comment is required';
    } else if (comment.length < 3) {
      this.validation.comment.isValid = false;
      this.validation.comment.errorMessage = 'Comment must be at least 3 characters long';
    } else if (comment.length > 500) {
      this.validation.comment.isValid = false;
      this.validation.comment.errorMessage = 'Comment cannot exceed 500 characters';
    } else {
      this.validation.comment.isValid = true;
      this.validation.comment.errorMessage = '';
    }
  }


  // 2L- Toggle like state and update global like count
  async toggleLike() {
    console.log('toggleLike called');
    
    if (this.artwork?.objectID) {
      console.log('Artwork ID found:', this.artwork.objectID);
      console.log('Current like state:', this.isLiked);
      console.log('Show remove button:', this.showRemoveButton);
      
      // If user is trying to unlike from home page, show confirmation alert
      if (this.isLiked && !this.showRemoveButton) {
        console.log('Should show confirmation alert');

        const artworkTitle = this.artwork.title || 'this artwork';
        const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
        
        console.log('Creating alert with title:', artworkTitle);
        console.log('Artist name:', artistName);
        
        try {
          const alert = await this.alertController.create({
            header: 'Remove from Liked Artworks',
            message: `Are you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`,
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'alert-button-cancel secondary',
                
                handler: () => {
                  console.log('Cancel clicked');
                  return false;
                }
              },
              {
                text: 'Yes, Remove',
                cssClass: 'alert-button-danger danger',
                handler: () => {
                  console.log('Remove clicked');
                  this.performToggleLike();
                  return true;
                }
              }
            ]
          });

          console.log('Alert created successfully');
          await alert.present();
          console.log('Alert presented successfully');
        } catch (error) {
          console.error('Error creating/presenting alert:', error);
          // Fallback: proceed with the action if alert fails
          console.log('Fallback: proceeding with toggle');
          this.performToggleLike();
        }
        return;
      }

      // If liking or using remove button, proceed directly
      console.log('Proceeding directly with toggle');
      this.performToggleLike();
    } else {
      console.log('No artwork ID found');
    }
  }

  // Separated logic for actual like/unlike operation
  private performToggleLike() {
    if (this.artwork?.objectID) {
      // Store previous state for rollback on error
      const previousLikedState = this.isLiked;
      const previousLikeCount = this.likes;
      
      // Optimistic update for immediate UI feedback
      this.isLiked = !this.isLiked;
      
      // Only increase like count when liking, don't decrease when unliking
      if (this.isLiked) {
        this.likes = this.likes + 1;
      }
      // When unliking, keep the same like count (don't decrease)
      
      // Update services based on like state
      this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
      this.saveUserLike(this.artwork.objectID.toString(), this.isLiked); 
      
      if (this.isLiked) {
        this.likedArtworksService.addLikedArtwork(this.artwork);
      } else {
        this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
      }
      
      // Only sync with API when liking (increasing count)
      if (this.isLiked) {
        const likeData: Like = {
          item_id: this.artwork.objectID.toString(),
          likes: this.likes
        };

        this.apiService.postLike(likeData).subscribe({
          next: (response) => {
            if (response && typeof response.likes === 'number') {
              this.likes = response.likes;
              this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
            }
          },
          error: (error) => {
            console.error('Error posting like:', error);
            // Rollback all changes on error
            this.isLiked = previousLikedState;
            this.likes = previousLikeCount;
            this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
            this.saveUserLike(this.artwork.objectID.toString(), this.isLiked);
            
            if (previousLikedState) {
              this.likedArtworksService.addLikedArtwork(this.artwork);
            } else {
              this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
            }
          }
        });
      }
    }
  }

  // Remove artwork from user's liked list (Tab3 only)
  async removeFromLiked() {
    if (!this.artwork?.objectID) return;

    const artworkTitle = this.artwork.title || 'this artwork';
    const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
    
    try {
      const alert = await this.alertController.create({
        header: 'Remove from Liked Artworks',
        message: `Are you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'alert-button-cancel secondary',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Yes, Remove',
            cssClass: 'alert-button-danger danger',
            handler: () => {
              console.log('Remove clicked');
              this.confirmRemoveFromLiked();
            }
          }
        ]
      });

      await alert.present();
      console.log('Alert presented');
    } catch (error) {
      console.error('Error creating alert:', error);
      // Fallback: proceed with the action if alert fails
      this.confirmRemoveFromLiked();
    }
  }

  // Execute removal after user confirmation
  private confirmRemoveFromLiked() {
    if (this.artwork?.objectID) {
      this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
      this.isLiked = false;
      this.saveUserLike(this.artwork.objectID.toString(), false);
      this.loadLikes(); // Reload to show actual global count
    }
  }

  
  // Add new comment with validation
  addComment() {
    const username = this.newComment.username.trim();
    const comment = this.newComment.comment.trim();
    
    // Quick validation before submission
    if (!username || username.length < 2 || username.length > 50) {
      return;
    }
    
    if (!comment || comment.length < 3 || comment.length > 500) {
      return;
    }
    
    if (!/^[a-zA-Z0-9\s._-]+$/.test(username)) {
      return;
    }

    const commentData: Comment = {
      item_id: this.artwork.objectID.toString(),
      username: username,
      comment: comment,
      creation_date: new Date().toISOString()
    };

    this.apiService.postComment(commentData).subscribe({
      next: (comment) => {
        // Add the new comment to the list
        this.comments.push(comment);
        
        // Reset form to initial state
        this.resetFormToInitialState();
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  // Helper method to reset form to initial state
  private resetFormToInitialState() {
    // Clear form fields immediately
    this.newComment = { username: '', comment: '' };
    
    // Reset all state flags to initial state
    this.justSubmitted = true;
    this.isResetState = true;
    
    // Reset validation state to default (valid) - this ensures gray labels
    this.validation = {
      username: { isValid: true, errorMessage: '' },
      comment: { isValid: true, errorMessage: '' }
    };
    
    // Force change detection to ensure UI updates
    setTimeout(() => {
      // Keep form in gray state for visual feedback
      this.justSubmitted = false;
      // Keep isResetState = true so form stays gray until user starts typing
    }, 1000); // Reduced to 1 second for better UX
  }

  // Modal management methods
  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal.dismiss();
  }

  getModalId() {
    return `modal-${this.artwork?.objectID || 'unknown'}`;
  }

  openModal() {
    console.log('openModal called for artwork:', this.artwork?.objectID);
    console.log('Modal reference:', this.modal);
    
    // Refresh comments when modal opens
    this.loadComments();
    
    if (this.modal) {
      console.log('Presenting modal...');
      this.modal.present();
    } else {
      console.log('Modal not available, retrying in 100ms...');
      setTimeout(() => {
        if (this.modal) {
          console.log('Presenting modal after timeout...');
          this.modal.present();
        } else {
          console.log('Modal still not available after timeout');
        }
      }, 100);
    }
  }

  // Debug method to test specific API endpoint
  testApiEndpoint() {
    // Only test for the specific artwork ID you want to debug
    if (this.artwork?.objectID === 451023) {
      const testUrl = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/pKSoTbGzFhj5RtoeFQif/comments?item_id=451023';
      console.log('🔍 Testing API endpoint for artwork 451023:', testUrl);
      console.log('Artwork Name:', this.artwork?.title || 'No title available');
      console.log('Artwork ID:', this.artwork?.objectID || 'No ID available');
      
      this.http.get(testUrl).subscribe({
        next: (response) => {
          console.log('RAW API Response for item_id=451023:', response);
          console.log('Response type:', typeof response);
          console.log('Is Array:', Array.isArray(response));
          if (Array.isArray(response)) {
            console.log('Number of comments:', response.length);
            response.forEach((comment, index) => {
              console.log(`Comment ${index + 1}:`, comment);
            });
          }
        },
        error: (error) => {
          console.error('API Error:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
        }
      });
    }
  }

  //2c- Helper method to get validation CSS class
  // Helper method to get validation CSS class
  getValidationClass(field: 'username' | 'comment'): string { 
    // If just submitted, always return gray (post-submission feedback)
    if (this.justSubmitted) {
      return 'force-gray';
    }
    
    // Initial state or when field is empty - return gray
    if (this.isResetState || this.newComment[field].trim().length === 0) {
      return 'force-gray';
    }
    
    // Only show validation colors when user has typed something
    if (this.newComment[field].trim().length > 0) {
      // Check validation state for active input
      if (!this.validation[field].isValid) {
        return 'invalid-state'; // Red for invalid input
      }
      return 'valid-state'; // Green for valid input
    }
    
    // Default to gray
    return 'force-gray';
  }
}