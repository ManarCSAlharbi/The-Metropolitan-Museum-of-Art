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

  // Get observable of liked artworks
  getLikedArtworks(): Observable<LikedArtwork[]> {
    return this.likedArtworksSubject.asObservable();
  }

  // Get current liked artworks array
  getCurrentLikedArtworks(): LikedArtwork[] {
    return [...this.likedArtworks];
  }

  // Add artwork to liked list
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
      console.log('Artwork added to liked list:', likedArtwork);
    }
  }

  // Remove artwork from liked list
  removeLikedArtwork(objectID: number): void {
    const index = this.likedArtworks.findIndex(
      item => item.objectID === objectID
    );

    if (index !== -1) {
      const removed = this.likedArtworks.splice(index, 1)[0];
      this.saveLikedArtworks();
      this.likedArtworksSubject.next([...this.likedArtworks]);
      console.log('Artwork removed from liked list:', removed);
    }
  }

  // Check if artwork is liked
  isArtworkLiked(objectID: number): boolean {
    return this.likedArtworks.some(item => item.objectID === objectID);
  }

  // Get count of liked artworks
  getLikedCount(): number {
    return this.likedArtworks.length;
  }

  // Load liked artworks from localStorage
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

  // Save liked artworks to localStorage
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
