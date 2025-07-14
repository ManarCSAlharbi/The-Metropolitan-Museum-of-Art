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
    // Removed loadLikedArtworks call
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
      // Removed saveLikedArtworks call
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
      // Removed saveLikedArtworks call
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

  // Clear all liked artworks
  clearAllLikedArtworks(): void {
    this.likedArtworks = [];
    //this.saveLikedArtworks();
    this.likedArtworksSubject.next([]);
  }
}
