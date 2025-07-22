import { Component, Input, OnInit, OnDestroy, ViewChild, input, ChangeDetectorRef } from '@angular/core';
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
  @Input() departmentName?: string; // New input for department name
  @Input() objectURL?: string; // Optional input for object URL
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
    private http: HttpClient,
    private cdr: ChangeDetectorRef
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
    
    // Test the specific API endpoint for debugging - commented out
    // this.testApiEndpoint();
    
    // Subscribe to liked artworks changes for real-time updates
    this.likedArtworksSubscription = this.likedArtworksService.getLikedArtworks().subscribe(
      (likedArtworks) => {
        if (this.artwork?.objectID) {
          const newIsLiked = likedArtworks.some(artwork => artwork.objectID === this.artwork.objectID);
          if (this.isLiked !== newIsLiked) {
            console.log(`🔄 Like state changed from ${this.isLiked} to ${newIsLiked} for artwork ${this.artwork.objectID}`);
            this.isLiked = newIsLiked;
            this.detectChanges();
          }
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
    
    if (this.justSubmitted) {
      // Still in submission state, keep gray color
      return;
    }
    
    this.isResetState = false; // User is now typing, exit initial state Signals that user is no longer in the initial/default state
                               //Allows validation colors to start working (red/green feedback)

    
    // If just submitted and user starts typing, reset the state 
    if (this.justSubmitted && (this.newComment.username.length > 0 || this.newComment.comment.length > 0)) {
      this.justSubmitted = false;
    }
    
    this.onUserInput();//Calls the real-time validation method
                       //starts the validation process for the current input
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
  toggleLike() {
    console.log(' TOGGLE LIKE CALLED - Android Debug');
    console.log('Current isLiked state:', this.isLiked);
    console.log('showRemoveButton:', this.showRemoveButton);
    console.log('artwork ID:', this.artwork?.objectID);
    
    if (this.artwork?.objectID) {
      // If user is trying to unlike from home page, show confirmation alert
      if (this.isLiked && !this.showRemoveButton) {
        console.log(' Showing confirmation alert for unlike');
        
        const artworkTitle = this.artwork.title || 'this artwork';
        const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
        
        const confirmed = confirm(`Remove from Liked Artworks\n\nAre you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`);
        
        if (confirmed) {
          console.log(' User confirmed unlike via native confirm');
          this.performToggleLike();
        } else {
          console.log(' User cancelled unlike via native confirm');
        }
        return;
      } else {
        console.log('🚀 Direct toggle (liking or Tab3 remove)');
      }

      // If liking or using remove button, proceed directly
      this.performToggleLike();
    }
  }

  // Separated logic for actual like/unlike operation
  private performToggleLike() {
    console.log(' PERFORM TOGGLE LIKE - Android Debug');
    console.log('Before toggle - isLiked:', this.isLiked, 'likes:', this.likes);
    console.log(' Artwork ID:', this.artwork?.objectID);
    console.log(' Artwork Title:', this.artwork?.title);
    
    if (this.artwork?.objectID) {
      // Store previous state for rollback on error
      const previousLikedState = this.isLiked;
      const previousLikeCount = this.likes;
      
      // Toggle the like state AGGRESSIVELY
      this.isLiked = !this.isLiked;
      console.log(' STATE CHANGED - NEW isLiked:', this.isLiked);
      
      // Only increase like count when liking, don't decrease when unliking
      if (this.isLiked) {
        this.likes = this.likes + 1;
        console.log(' LIKING - New count:', this.likes);
      } else {
        console.log(' UNLIKING - Count stays:', this.likes);
      }
      
      // SUPER AGGRESSIVE CHANGE DETECTION FOR ANDROID
      console.log(' Starting aggressive change detection...');
      this.detectChanges();
      
      // Force multiple change detections with delays
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          console.log(` Change detection round ${i + 1}`);
          this.detectChanges();
        }, i * 25);
      }
      
      // Update services based on like state
      console.log(' Updating services...');
      this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
      
      if (this.isLiked) {
        console.log(' Adding artwork to service...');
        this.likedArtworksService.addLikedArtwork(this.artwork);
        console.log(' Added to liked artworks service');
      } else {
        console.log(' Removing artwork from service...');
        console.log(' Before removal - service has artwork:', this.likedArtworksService.isArtworkLiked(this.artwork.objectID));
        this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
        console.log(' After removal - service has artwork:', this.likedArtworksService.isArtworkLiked(this.artwork.objectID));
        console.log(' Removed from liked artworks service');
      }
      
      // Check services state
      console.log(' Checking service states...');
      console.log('Is liked in service:', this.likedArtworksService.isArtworkLiked(this.artwork.objectID));
      console.log('Like count in service:', this.likeCountService.getLikeCount(this.artwork.objectID));
      
      // Sync with API for both like and unlike operations
      const likeData: Like = {
        item_id: this.artwork.objectID.toString(),
        likes: this.likes
      };

      console.log(' Sending to API:', likeData);

      this.apiService.postLike(likeData).subscribe({
        next: (response) => {
          console.log(' API SUCCESS:', response);
          if (response && typeof response.likes === 'number') {
            this.likes = response.likes;
            this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
            console.log(' Updated count from API:', this.likes);
          }
          // Force another change detection after API response
          console.log(' Final change detection after API success');
          this.detectChanges();
        },
        error: (error) => {
          console.error(' API ERROR:', error);
          // Rollback all changes on error
          console.log(' Rolling back changes...');
          this.isLiked = previousLikedState;
          this.likes = previousLikeCount;
          this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
          
          if (previousLikedState) {
            this.likedArtworksService.addLikedArtwork(this.artwork);
          } else {
            this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
          }
          
          // Force change detection after rollback
          this.detectChanges();
          console.log(' Rolled back to:', this.isLiked);
        }
      });
      
      console.log(' End of performToggleLike - Final state:', this.isLiked);
      console.log(' Final like count:', this.likes);
    }
  }

  // Force change detection for Android compatibility
  private detectChanges() {
    try {
      console.log(' Forcing change detection...');
      
      // Primary change detection
      this.cdr.detectChanges();
      
      // Mark for check
      this.cdr.markForCheck();
      
      // Also force check on the next tick with multiple attempts
      setTimeout(() => {
        try {
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          console.log(' Change detection cycle 1 completed');
        } catch (e) {
          console.log('Change detection cycle 1 failed:', e);
        }
      }, 0);
      
      // Second attempt after 10ms
      setTimeout(() => {
        try {
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          console.log(' Change detection cycle 2 completed');
        } catch (e) {
          console.log(' Change detection cycle 2 failed:', e);
        }
      }, 10);
      
      // Third attempt after 50ms
      setTimeout(() => {
        try {
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          console.log(' Change detection cycle 3 completed');
        } catch (e) {
          console.log(' Change detection cycle 3 failed:', e);
        }
      }, 50);
      
    } catch (error) {
      console.log(' Primary change detection failed:', error);
    }
  }

  // Remove artwork from user's liked list (Tab3 only)
  removeFromLiked() {
    if (!this.artwork?.objectID) return;

    const artworkTitle = this.artwork.title || 'this artwork';
    const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
    
    const confirmed = confirm(`Remove from Liked Artworks\n\nAre you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`);
    
    if (confirmed) {
      console.log(' User confirmed removal via native confirm');
      this.confirmRemoveFromLiked();
    } else {
      console.log(' User cancelled removal via native confirm');
    }
  }

  // Execute removal after user confirmation
  private confirmRemoveFromLiked() {
    if (this.artwork?.objectID) {
      this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
      this.isLiked = false;
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
        this.comments.push(comment);
        this.justSubmitted = true;
        this.isResetState = true; // Return to reset state
        this.newComment = { username: '', comment: '' };
        
        // Reset validation state to default
        this.validation = {
          username: { isValid: true, errorMessage: '' },
          comment: { isValid: true, errorMessage: '' }
        };
        
        // Keep gray state longer to ensure visual feedback
        setTimeout(() => {
          this.justSubmitted = false;
        }, 2000); // Extended to 2 seconds
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
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
    // If just submitted, always return gray
    if (this.justSubmitted) {
      return 'force-gray';
    }
    
    
    // Default state or when field is empty return gray
    if (this.isResetState || this.newComment[field].trim().length === 0) {
      return 'force-gray';
    }
    
    // Check validation state
    if (!this.validation[field].isValid) {
      return 'invalid-state'; // When user input is invalid
    }
    
    return 'valid-state'; // When user input is valid
  }
}