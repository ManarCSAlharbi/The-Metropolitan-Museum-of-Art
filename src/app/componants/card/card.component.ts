import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
  IonTitle, IonContent, IonButtons, IonInput, IonTextarea, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, heart, heartOutline } from 'ionicons/icons';
import { ApiService, Comment, Like } from '../../services/api/api.service';
import { LikedArtworksService } from '../../services/liked-artworks/liked-artworks.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    IonList, IonTextarea, IonInput, IonButtons,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
    IonContent, IonItem, IonLabel,
    CommonModule, FormsModule
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
  
  @Input() artwork!: any; // objet representing the artwork 
  @Input() showRemoveButton: boolean = false; // Show remove button in Tab3
  @ViewChild(IonModal) modal?: IonModal;
  presentingElement: HTMLElement | null = null;

  comments: Comment[] = [];
  likes: number = 0;
  isLiked: boolean = false;
  newComment = {
    username: '',
    comment: ''
  };

  private likedArtworksSubscription?: Subscription;
  public justSubmitted: boolean = false; // Flag to track recent submission

  // Validation states
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
    private alertController: AlertController
  ) {
    addIcons({ close, heart, heartOutline });
  }

  ngOnInit() {
    this.presentingElement = document.querySelector('ion-router-outlet');
    console.log('CardComponent initialized with artwork:', this.artwork);
    this.loadLikes();
    
    // Subscribe to liked artworks changes to keep the heart state in sync
    this.likedArtworksSubscription = this.likedArtworksService.getLikedArtworks().subscribe(
      (likedArtworks) => {
        if (this.artwork?.objectID) {
          const wasLiked = this.isLiked;
          this.isLiked = likedArtworks.some(artwork => artwork.objectID === this.artwork.objectID);
          
          // Log state change for debugging
          if (wasLiked !== this.isLiked) {
            console.log(`Card ${this.artwork.objectID} like state changed: ${wasLiked} -> ${this.isLiked}`);
          }
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.likedArtworksSubscription) {
      this.likedArtworksSubscription.unsubscribe();
    }
  }

  // Load comments when modal opens
  loadComments() {
    if (this.artwork?.objectID) {
      console.log('Loading comments for artwork ID:', this.artwork.objectID);
      this.apiService.getComments(this.artwork.objectID.toString()).subscribe({
        next: (comments) => {
          console.log('Comments loaded:', comments);
          this.comments = comments;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.comments = [];
        }
      });
    }
  }

  // Load likes when component initializes
  loadLikes() {
    if (this.artwork?.objectID) {
      console.log('Loading likes for artwork ID:', this.artwork.objectID);
      this.apiService.getLikes(this.artwork.objectID.toString()).subscribe({
        next: (likeData) => {
          console.log('Likes loaded:', likeData);
          this.likes = likeData.likes || 0;
          // Check if user has already liked this artwork (you can implement user-specific logic here)
          this.isLiked = this.checkIfUserLiked(this.artwork.objectID.toString());
        },
        error: (error) => {
          console.error('Error loading likes:', error);
          this.likes = 0;
          this.isLiked = this.checkIfUserLiked(this.artwork.objectID.toString());
        }
      });
    }
  }

  // Check if user has liked this artwork (using the service)
  private checkIfUserLiked(itemId: string): boolean {
    return this.likedArtworksService.isArtworkLiked(parseInt(itemId));
  }

  // Save user's like status to localStorage (kept for backward compatibility)
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

  // Reset the justSubmitted flag when user starts typing
  onUserInput() {
    // Don't do anything if we just submitted
    if (this.justSubmitted) {
      return;
    }
    
    // Simple validation - only show errors for fields with content
    if (this.newComment.username.trim().length > 0) {
      this.validateUsername();
    }
    
    if (this.newComment.comment.trim().length > 0) {
      this.validateComment();
    }
  }

  // Handle when user starts typing after submission
  onUserStartsTyping() {
    // Reset the flag when user starts typing new content
    if (this.justSubmitted && (this.newComment.username.length > 0 || this.newComment.comment.length > 0)) {
      this.justSubmitted = false;
    }
    
    // Call normal validation
    this.onUserInput();
  }

  // Validate username input
  validateUsername() {
    const username = this.newComment.username.trim();
    
    if (!username) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name is required';
    } else if (username.length < 2) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name must be at least 2 characters long';
    } else if (username.length > 50) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z0-9\s._-]+$/.test(username)) {
      this.validation.username.isValid = false;
      this.validation.username.errorMessage = 'Name can only contain letters, numbers, spaces, dots, hyphens, and underscores';
    } else {
      this.validation.username.isValid = true;
      this.validation.username.errorMessage = '';
    }
  }

  // Validate comment input
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

  // Validate all fields
  validateAllFields(): boolean {
    this.validateUsername();
    this.validateComment();
    return this.validation.username.isValid && this.validation.comment.isValid;
  }

  // Toggle like/unlike
  toggleLike() {
    if (this.artwork?.objectID) {
      // Store current state for potential revert
      const previousLikedState = this.isLiked;
      const previousLikeCount = this.likes;
      
      // Optimistic update - update UI immediately
      this.isLiked = !this.isLiked;
      this.likes = this.isLiked ? this.likes + 1 : this.likes - 1;
      
      // Save the like state to localStorage immediately (backward compatibility)
      this.saveUserLike(this.artwork.objectID.toString(), this.isLiked);
      
      // Add or remove from liked artworks service
      if (this.isLiked) {
        this.likedArtworksService.addLikedArtwork(this.artwork);
      } else {
        this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
      }
      
      const likeData: Like = {
        item_id: this.artwork.objectID.toString(),
        likes: this.likes
      };

      this.apiService.postLike(likeData).subscribe({
        next: (response) => {
          console.log('Like toggled successfully:', response);
          console.log('Current state - isLiked:', this.isLiked, 'likes:', this.likes);
          // Like state is already saved, no need to revert
        },
        error: (error) => {
          console.error('Error toggling like:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            ok: error.ok
          });
          // Revert optimistic update on error
          this.isLiked = previousLikedState;
          this.likes = previousLikeCount;
          // Revert localStorage as well
          this.saveUserLike(this.artwork.objectID.toString(), this.isLiked);
          // Revert liked artworks service
          if (previousLikedState) {
            this.likedArtworksService.addLikedArtwork(this.artwork);
          } else {
            this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
          }
        }
      });
    }
  }

  // Remove artwork from liked list (for Tab3) - with confirmation
  async removeFromLiked() {
    if (!this.artwork?.objectID) return;

    const artworkTitle = this.artwork.title || 'this artwork';
    const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
    
    const alert = await this.alertController.create({
      header: 'Remove from Liked Artworks',
      message: `Are you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('User cancelled removal');
          }
        },
        {
          text: 'Yes, Remove',
          cssClass: 'danger',
          handler: () => {
            this.confirmRemoveFromLiked();
          }
        }
      ]
    });

    await alert.present();
  }

  // Actually remove the artwork after confirmation
  private confirmRemoveFromLiked() {
    if (this.artwork?.objectID) {
      // Remove from liked artworks service
      this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
      
      // Update local state
      this.isLiked = false;
      if (this.likes > 0) {
        this.likes--;
      }
      
      // Update localStorage for backward compatibility
      this.saveUserLike(this.artwork.objectID.toString(), false);
      
      // Send API request to update likes count
      const likeData: Like = {
        item_id: this.artwork.objectID.toString(),
        likes: this.likes
      };

      this.apiService.postLike(likeData).subscribe({
        next: (response) => {
          console.log('Artwork removed from liked list successfully:', response);
        },
        error: (error) => {
          console.error('Error removing artwork from liked list:', error);
        }
      });
    }
  }

  // Add a new comment
  addComment() {
    // Check if fields have content without affecting validation state
    const username = this.newComment.username.trim();
    const comment = this.newComment.comment.trim();
    
    // Simple validation without setting validation state
    if (!username || username.length < 2 || username.length > 50) {
      console.log('Username validation failed');
      return;
    }
    
    if (!comment || comment.length < 3 || comment.length > 500) {
      console.log('Comment validation failed');
      return;
    }
    
    if (!/^[a-zA-Z0-9\s._-]+$/.test(username)) {
      console.log('Username contains invalid characters');
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
        
        // Set flag to prevent validation errors on empty fields
        this.justSubmitted = true;
        
        // Clear the form
        this.newComment = { username: '', comment: '' };
        
        // Reset validation to valid state
        this.validation = {
          username: { isValid: true, errorMessage: '' },
          comment: { isValid: true, errorMessage: '' }
        };
        
        console.log('Comment added successfully:', comment);
        
        // Reset flag after 1 second
        setTimeout(() => {
          this.justSubmitted = false;
        }, 1000);
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  // Close modals dispatched by the button triggers
  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal.dismiss();
  }
}