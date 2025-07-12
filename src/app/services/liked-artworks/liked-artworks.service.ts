import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LikedArtwork {
  objectID: number;
  title: string;
  artistDisplayName: string;
  primaryImageSmall: string;
  primaryImage: string;
  dimensions: string;
  objectDate: string;
  likedAt: string; // Timestamp when it was liked
}

@Injectable({
  providedIn: 'root'
})
export class LikedArtworksService {
  private likedArtworks: LikedArtwork[] = [];
  private likedArtworksSubject = new BehaviorSubject<LikedArtwork[]>([]);
  
  constructor() {
    this.loadLikedArtworks();
  }

  // Get reactive stream of liked artworks
  getLikedArtworks(): Observable<LikedArtwork[]> {
    return this.likedArtworksSubject.asObservable();
  }

  // Get current snapshot of liked artworks
  getCurrentLikedArtworks(): LikedArtwork[] {
    return [...this.likedArtworks];
  }

  // Add artwork to user's liked collection
  addLikedArtwork(artwork: any): void {
    const existingIndex = this.likedArtworks.findIndex(
      item => item.objectID === artwork.objectID
    );

    if (existingIndex === -1) {
      const likedArtwork: LikedArtwork = {
        objectID: artwork.objectID,
        title: artwork.title,
        artistDisplayName: artwork.artistDisplayName,
        primaryImageSmall: artwork.primaryImageSmall,
        primaryImage: artwork.primaryImage,
        dimensions: artwork.dimensions,
        objectDate: artwork.objectDate,
        likedAt: new Date().toISOString()
      };

      this.likedArtworks.unshift(likedArtwork); // Add to beginning
      this.saveLikedArtworks();
      this.likedArtworksSubject.next([...this.likedArtworks]);
    }
  }

  // Remove artwork from user's liked collection
  removeLikedArtwork(objectID: number): void {
    const index = this.likedArtworks.findIndex(
      item => item.objectID === objectID
    );

    if (index !== -1) {
      this.likedArtworks.splice(index, 1);
      this.saveLikedArtworks();
      this.likedArtworksSubject.next([...this.likedArtworks]);
    }
  }

  // Check if artwork is in user's liked collection
  isArtworkLiked(objectID: number): boolean {
    return this.likedArtworks.some(item => item.objectID === objectID);
  }

  // Get total count of liked artworks
  getLikedCount(): number {
    return this.likedArtworks.length;
  }

  // Load liked artworks from localStorage on service initialization
  private loadLikedArtworks(): void {
    try {
      const stored = localStorage.getItem('likedArtworksData');
      if (stored) {
        this.likedArtworks = JSON.parse(stored);
        this.likedArtworksSubject.next([...this.likedArtworks]);
      }
    } catch (error) {
      console.error('Error loading liked artworks:', error);
      this.likedArtworks = [];
    }
  }

  // Persist liked artworks to localStorage
  private saveLikedArtworks(): void {
    try {
      localStorage.setItem('likedArtworksData', JSON.stringify(this.likedArtworks));
    } catch (error) {
      console.error('Error saving liked artworks:', error);
    }
  }

  // Clear all liked artworks
  clearAllLikedArtworks(): void {
    this.likedArtworks = [];
    this.saveLikedArtworks();
    this.likedArtworksSubject.next([]);
  }
}
