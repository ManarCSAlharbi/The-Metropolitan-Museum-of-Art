import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, filter, forkJoin, from, map, mergeMap, of, switchMap, toArray, catchError } from 'rxjs';
export interface Artwork {
  objectID: number;
  title: string;
  artistDisplayName: string;
  primaryImageSmall: string;
  primaryImage: string;
  dimensions: string;
  objectDate: string;
  // …etc.
}

export interface Comment {
  item_id: string;
  username: string;
  comment: string;
  creation_date: string;
}

export interface Like {
  item_id: string;
  likes: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
private apiUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
private commentsUrl = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/pKSoTbGzFhj5RtoeFQif/comments';
private likesUrl = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/pKSoTbGzFhj5RtoeFQif/likes';

  constructor(private http: HttpClient) {}
  getArtworks(batchSize: number = 10): Observable<Artwork[]> {
    const params = '?q=painting&hasImages=true';
    return this.http
      .get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}`)
      .pipe(
        map(res => {
          // Shuffle IDs and pick a batch
          const shuffled = res.objectIDs.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, batchSize);
        }),
        mergeMap(ids => from(ids)),
        mergeMap(id => this.getArtworkById(id)),
        filter((artwork: Artwork) => Boolean(artwork.primaryImageSmall || artwork.primaryImage)),
        toArray()
      );
  }

  searchArtworks(query: string, limit: number = 20): Observable<Artwork[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    const params = `?q=${encodeURIComponent(query)}&hasImages=true`;
    return this.http
      .get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}`)
      .pipe(
        map(res => {
          if (!res.objectIDs || res.objectIDs.length === 0) {
            return [];
          }
          // Limit results for better performance
          return res.objectIDs.slice(0, limit);
        }),
        switchMap(ids => {
          if (ids.length === 0) {
            return of([]);
          }
          return from(ids).pipe(
            mergeMap(id => this.getArtworkById(id).pipe(
              catchError(() => of(null)) // Handle individual artwork fetch errors
            )),
            filter((artwork: Artwork | null): artwork is Artwork => 
              artwork !== null && Boolean(artwork.primaryImageSmall || artwork.primaryImage)
            ),
            toArray(),
            map(artworks => this.filterRelevantArtworks(artworks, query))
          );
        }),
        catchError(error => {
          console.error('Search error:', error);
          return of([]);
        })
      );
  }

  private filterRelevantArtworks(artworks: Artwork[], query: string): Artwork[] {
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/);
    
    // Score each artwork based on relevance
    const scoredArtworks = artworks.map(artwork => {
      let score = 0;
      const title = (artwork.title || '').toLowerCase();
      const artist = (artwork.artistDisplayName || '').toLowerCase();
      const combined = `${title} ${artist}`;
      
      // Exact title match gets highest score
      if (title === queryLower) {
        score += 100;
      }
      // Exact artist match gets high score
      else if (artist === queryLower) {
        score += 90;
      }
      // Title contains exact query gets high score
      else if (title.includes(queryLower)) {
        score += 80;
      }
      // Artist contains exact query gets good score
      else if (artist.includes(queryLower)) {
        score += 70;
      }
      // Check for all query words in title/artist
      else {
        const titleWords = title.split(/\s+/);
        const artistWords = artist.split(/\s+/);
        let wordMatches = 0;
        
        queryWords.forEach(queryWord => {
          if (queryWord.length > 2) { // Only consider words longer than 2 characters
            if (titleWords.some(word => word.includes(queryWord))) {
              wordMatches += 10;
            }
            if (artistWords.some(word => word.includes(queryWord))) {
              wordMatches += 8;
            }
          }
        });
        score += wordMatches;
      }
      
      return { artwork, score };
    });
    
    // Filter artworks with score > 0 and sort by score (highest first)
    const relevantArtworks = scoredArtworks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.artwork);
    
    // If we have high-scoring matches (exact or very close), return only those
    const highScoreArtworks = scoredArtworks
      .filter(item => item.score >= 70)
      .sort((a, b) => b.score - a.score)
      .map(item => item.artwork);
    
    if (highScoreArtworks.length > 0) {
      return highScoreArtworks.slice(0, 5); // Return top 5 high-scoring matches
    }
    
    // Otherwise return all relevant matches
    return relevantArtworks.slice(0, 10); // Return top 10 relevant matches
  }

  getArtworkById(id: number): Observable<Artwork> {
    return this.http.get<Artwork>(`${this.apiUrl}/objects/${id}`);
  }

  getComments(itemId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.commentsUrl}?item_id=${itemId}`);
  }

  getLikes(itemId: string): Observable<Like> {
    return this.http.get<Like[]>(`${this.likesUrl}?item_id=${itemId}`).pipe(
      map(likes => {
        // Find the like for this specific item
        const itemLike = likes.find(like => like.item_id === itemId);
        return itemLike || { item_id: itemId, likes: 0 };
      })
    );
  }

  postLike(likeData: Like): Observable<Like> {
    return this.http.post<Like>(this.likesUrl, likeData).pipe(
      catchError((error: HttpErrorResponse) => {
        // If the status is 201 (Created), treat it as success
        if (error.status === 201) {
          console.log('Like posted successfully with status 201');
          return of(likeData); // Return the original data as success
        }
        // For other errors, re-throw them
        throw error;
      })
    );
  }

  postComment(commentData: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.commentsUrl, commentData).pipe(
      catchError((error: HttpErrorResponse) => {
        // If the status is 201 (Created), treat it as success
        if (error.status === 201) {
          console.log('Comment posted successfully with status 201');
          return of(commentData); // Return the original data as success
        }
        // For other errors, re-throw them
        throw error;
      })
    );
  }
  
}