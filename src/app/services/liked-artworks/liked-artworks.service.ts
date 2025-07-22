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
    console.log(`➕ SERVICE: Attempting to add artwork ${artwork.objectID} - "${artwork.title}"`);
    console.log(`➕ SERVICE: Current liked artworks count: ${this.likedArtworks.length}`);
    
    const existingIndex = this.likedArtworks.findIndex(
      item => item.objectID === artwork.objectID
    );

    console.log(`➕ SERVICE: Existing artwork index: ${existingIndex}`);

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
      console.log(`➕ SERVICE: Added artwork "${artwork.title}" (ID: ${artwork.objectID})`);
      console.log(`➕ SERVICE: New liked artworks count: ${this.likedArtworks.length}`);
      
      // Removed saveLikedArtworks call
      this.likedArtworksSubject.next([...this.likedArtworks]);
      console.log(`➕ SERVICE: Notified subscribers of change`);
    } else {
      console.log(`➕ SERVICE: Artwork ${artwork.objectID} already exists in liked collection`);
    }
  }

  // Remove artwork from user's liked collection
  removeLikedArtwork(objectID: number): void {
    console.log(`🗑️ SERVICE: Attempting to remove artwork ${objectID}`);
    console.log(`🗑️ SERVICE: Current liked artworks count: ${this.likedArtworks.length}`);
    console.log(`🗑️ SERVICE: Artwork IDs in collection:`, this.likedArtworks.map(a => a.objectID));
    
    const index = this.likedArtworks.findIndex(
      item => item.objectID === objectID
    );

    console.log(`🗑️ SERVICE: Found artwork at index: ${index}`);

    if (index !== -1) {
      const removedArtwork = this.likedArtworks[index];
      this.likedArtworks.splice(index, 1);
      console.log(`🗑️ SERVICE: Removed artwork "${removedArtwork.title}" (ID: ${objectID})`);
      console.log(`🗑️ SERVICE: New liked artworks count: ${this.likedArtworks.length}`);
      
      // Removed saveLikedArtworks call
      this.likedArtworksSubject.next([...this.likedArtworks]);
      console.log(`🗑️ SERVICE: Notified subscribers of change`);
    } else {
      console.log(`🗑️ SERVICE: Artwork ${objectID} not found in liked collection`);
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
