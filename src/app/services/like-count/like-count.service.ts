import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LikeCountUpdate {
  objectID: number;
  likes: number;
}

@Injectable({
  providedIn: 'root'
})
export class LikeCountService {
  private likeCountsSubject = new BehaviorSubject<Map<number, number>>(new Map());
  private likeCounts = new Map<number, number>();

  constructor() {}

  // Get reactive stream of like counts for real-time updates
  getLikeCounts(): Observable<Map<number, number>> {
    return this.likeCountsSubject.asObservable();
  }

  // Update like count for specific artwork and notify subscribers
  updateLikeCount(objectID: number, likes: number): void {
    this.likeCounts.set(objectID, likes);
    this.likeCountsSubject.next(new Map(this.likeCounts));
  }

  // Get cached like count for specific artwork
  getLikeCount(objectID: number): number {
    return this.likeCounts.get(objectID) || 0;
  }

  // Check if like count is cached for artwork
  hasLikeCount(objectID: number): boolean {
    return this.likeCounts.has(objectID);
  }

  // Reset all like counts (for testing/cleanup)
  clearAllLikeCounts(): void {
    this.likeCounts.clear();
    this.likeCountsSubject.next(new Map());
  }
}
