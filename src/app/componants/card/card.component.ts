import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
  IonContent, IonButtons, IonInput, IonTextarea, IonList, IonItem, IonLabel, IonTitle, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, heart, heartOutline, openOutline } from 'ionicons/icons';
import { ApiService, Comment, Like } from '../../services/api/api.service';
import { LikedArtworksService } from '../../services/liked-artworks/liked-artworks.service';
import { LikeCountService } from '../../services/like-count/like-count.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-card',
  standalone: true,
  imports: [IonRow, 
    IonList, IonTextarea, IonInput, IonButtons,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
    IonContent, IonItem, IonLabel, IonTitle,
    
    CommonModule, FormsModule, NgOptimizedImage
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
  
  @Input() artwork!: any;
  @Input() showRemoveButton: boolean = false;
  @Input() departmentName?: string;
  @Input() objectURL?: string;
  @ViewChild(IonModal) modal?: IonModal;

  // Comment system
  comments: Comment[] = [];
  newComment = {
    username: '',
    comment: ''
  };

  // Like system
  likes: number = 0;
  isLiked: boolean = false;

  // Form validation state
  validation = {
    username: { isValid: true, errorMessage: '' },
    comment: { isValid: true, errorMessage: '' }
  };

  // UI state management
  public justSubmitted: boolean = false;
  public isResetState: boolean = true;

  // Subscriptions for reactive updates
  private likedArtworksSubscription?: Subscription;
  private likeCountSubscription?: Subscription;

  constructor(
    private apiService: ApiService, 
    private likedArtworksService: LikedArtworksService,
    private likeCountService: LikeCountService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ heart, close, openOutline, heartOutline });
  }

  ngOnInit() {
    // Initialize like state from local storage
    if (this.artwork?.objectID) {
      this.isLiked = this.likedArtworksService.isArtworkLiked(this.artwork.objectID);
      
      // Use cached like count if available
      if (this.likeCountService.hasLikeCount(this.artwork.objectID)) {
        this.likes = this.likeCountService.getLikeCount(this.artwork.objectID);
      }
    }
    
    this.loadLikes();
    this.loadComments();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.likedArtworksSubscription?.unsubscribe();
    this.likeCountSubscription?.unsubscribe();
  }

  // Setup reactive subscriptions for real-time updates
  private setupSubscriptions() {
    // Subscribe to liked artworks changes
    this.likedArtworksSubscription = this.likedArtworksService.getLikedArtworks().subscribe(
      (likedArtworks) => {
        if (this.artwork?.objectID) {
          const newIsLiked = likedArtworks.some(artwork => artwork.objectID === this.artwork.objectID);
          if (this.isLiked !== newIsLiked) {
            this.isLiked = newIsLiked;
            this.detectChanges();
          }
        }
      }
    );

    // Subscribe to like count changes
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

  // Load comments for the artwork
  loadComments() {
    if (!this.artwork?.objectID) {
      this.comments = [];
      return;
    }

    this.apiService.getComments(this.artwork.objectID.toString()).subscribe({
      next: (comments) => {
        this.comments = Array.isArray(comments) ? comments : [];
        // Sort comments by creation date (newest first)
        this.comments.sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime());
      },
      error: (error) => {
        if (error.status !== 400) {
          console.error('Error loading comments:', error);
        }
        this.comments = [];
      }
    });
  }




  // Load like count from API and synchronize services
  loadLikes() {
    if (!this.artwork?.objectID) return;

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

  // Real-time form validation as user types
  onUserInput() {
    if (this.justSubmitted) return;
    
    if (this.newComment.username.trim().length > 0) {
      this.validateUsername();
    }
    
    if (this.newComment.comment.trim().length > 0) {
      this.validateComment();
    }
  }

  // Reset validation state when user starts typing after submission
  onUserStartsTyping() {
    if (this.justSubmitted) return;
    
    this.isResetState = false;
    
    if (this.justSubmitted && (this.newComment.username.length > 0 || this.newComment.comment.length > 0)) {
      this.justSubmitted = false;
    }
    
    this.onUserInput();
  }

  // Validate username input
  validateUsername() {
    const username = this.newComment.username.trim();
    
    if (!username) {
      this.setValidationError('username', 'Name is required');
    } else if (username.length < 2) {
      this.setValidationError('username', 'Name must be at least 2 characters long');
    } else if (username.length > 20) {
      this.setValidationError('username', 'Name cannot exceed 20 characters');
    } else if (!/^[a-zA-Z0-9\s._-]+$/.test(username)) {
      this.setValidationError('username', 'Name can only contain letters, numbers, spaces, dots, hyphens, and underscores');
    } else {
      this.setValidationSuccess('username');
    }
  }

  // Validate comment input
  validateComment() {
    const comment = this.newComment.comment.trim();
    
    if (!comment) {
      this.setValidationError('comment', 'Comment is required');
    } else if (comment.length < 3) {
      this.setValidationError('comment', 'Comment must be at least 3 characters long');
    } else if (comment.length > 500) {
      this.setValidationError('comment', 'Comment cannot exceed 500 characters');
    } else {
      this.setValidationSuccess('comment');
    }
  }

  // Helper methods for validation state
  private setValidationError(field: 'username' | 'comment', message: string) {
    this.validation[field].isValid = false;
    this.validation[field].errorMessage = message;
  }

  private setValidationSuccess(field: 'username' | 'comment') {
    this.validation[field].isValid = true;
    this.validation[field].errorMessage = '';
  }


  // Toggle like state with confirmation for unlike action
  toggleLike() {
    if (!this.artwork?.objectID) return;

    // Show confirmation when unliking from home page
    if (this.isLiked && !this.showRemoveButton) {
      this.showUnlikeConfirmation();
    } else {
      this.performToggleLike();
    }
  }

  // Show confirmation dialog for unlike action
  private showUnlikeConfirmation() {
    const artworkTitle = this.artwork.title || 'this artwork';
    const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
    
    const confirmed = confirm(`Remove from Liked Artworks\n\nAre you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`);
    
    if (confirmed) {
      this.performToggleLike();
    }
  }

  // Execute the like/unlike operation
  private performToggleLike() {
    if (!this.artwork?.objectID) return;

    const previousLikedState = this.isLiked;
    const previousLikeCount = this.likes;
    
    // Update UI immediately
    this.isLiked = !this.isLiked;
    if (this.isLiked) {
      this.likes = this.likes + 1;
    }
    
    this.detectChanges();
    this.updateServices();
    this.syncWithAPI(previousLikedState, previousLikeCount);
  }

  // Update local services with new state
  private updateServices() {
    this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
    
    if (this.isLiked) {
      this.likedArtworksService.addLikedArtwork(this.artwork);
    } else {
      this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
    }
  }

  // Sync changes with API
  private syncWithAPI(previousLikedState: boolean, previousLikeCount: number) {
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
        this.detectChanges();
      },
      error: (error) => {
        console.error('API Error:', error);
        this.rollbackChanges(previousLikedState, previousLikeCount);
      }
    });
  }

  // Rollback changes on API failure
  private rollbackChanges(previousLikedState: boolean, previousLikeCount: number) {
    this.isLiked = previousLikedState;
    this.likes = previousLikeCount;
    this.likeCountService.updateLikeCount(this.artwork.objectID, this.likes);
    
    if (previousLikedState) {
      this.likedArtworksService.addLikedArtwork(this.artwork);
    } else {
      this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
    }
    
    this.detectChanges();
  }

  // Force change detection for UI updates
  private detectChanges() {
    try {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
      
      // Additional change detection cycle for Android compatibility
      setTimeout(() => {
        try {
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        } catch (e) {
          // Silent fail - change detection cycles can fail safely
        }
      }, 0);
    } catch (error) {
      // Silent fail - change detection is not critical
    }
  }

  // Remove artwork from liked list (Tab3 only)
  removeFromLiked() {
    if (!this.artwork?.objectID) return;

    const artworkTitle = this.artwork.title || 'this artwork';
    const artistName = this.artwork.artistDisplayName || 'Unknown Artist';
    
    const confirmed = confirm(`Remove from Liked Artworks\n\nAre you sure you want to remove "${artworkTitle}" by ${artistName} from your liked artworks?`);
    
    if (confirmed) {
      this.confirmRemoveFromLiked();
    }
  }

  // Execute removal after user confirmation
  private confirmRemoveFromLiked() {
    if (this.artwork?.objectID) {
      this.likedArtworksService.removeLikedArtwork(this.artwork.objectID);
      this.isLiked = false;
      this.loadLikes();
    }
  }

  // Add new comment with validation
  addComment() {
    const username = this.newComment.username.trim();
    const comment = this.newComment.comment.trim();
    
    // Validate before submission
    if (!this.isValidComment(username, comment)) return;

    const commentData: Comment = {
      item_id: this.artwork.objectID.toString(),
      username: username,
      comment: comment,
      creation_date: new Date().toISOString()
    };

    this.apiService.postComment(commentData).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.resetCommentForm();
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  // Validate comment data before submission
  private isValidComment(username: string, comment: string): boolean {
    return username.length >= 2 && 
           username.length <= 50 && 
           comment.length >= 3 && 
           comment.length <= 500 && 
           /^[a-zA-Z0-9\s._-]+$/.test(username);
  }

  // Reset comment form after successful submission
  private resetCommentForm() {
    this.justSubmitted = true;
    this.isResetState = true;
    this.newComment = { username: '', comment: '' };
    
    // Reset validation state
    this.validation = {
      username: { isValid: true, errorMessage: '' },
      comment: { isValid: true, errorMessage: '' }
    };
    
    // Clear submission state after delay
    setTimeout(() => {
      this.justSubmitted = false;
    }, 2000);
  }

  // Modal management methods
  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal?.dismiss();
  }

  getModalId() {
    return `modal-${this.artwork?.objectID || 'unknown'}`;
  }

  openModal() {
    this.loadComments(); // Refresh comments when modal opens
    
    if (this.modal) {
      this.modal.present();
    } else {
      // Retry after brief delay if modal not ready
      setTimeout(() => {
        this.modal?.present();
      }, 100);
    }
  }

  // Get CSS class for form validation feedback
  getValidationClass(field: 'username' | 'comment'): string { 
    if (this.justSubmitted || this.isResetState || this.newComment[field].trim().length === 0) {
      return 'force-gray';
    }
    
    return this.validation[field].isValid ? 'valid-state' : 'invalid-state';
  }

  // Handle image loading errors
  onImageError(event: any) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/icon/favicon.png';
      target.removeAttribute('ng-reflect-ng-src');
    }
  }
}