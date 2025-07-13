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

  // Get random batch of artworks for home page
  getArtworks(batchSize: number = 10): Observable<Artwork[]> {
    const params = '?q=painting&hasImages=true';
    return this.http
      .get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}`)
      .pipe(
        map(res => {
          const shuffled = res.objectIDs.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, batchSize);
        }),
        mergeMap(ids => from(ids)),
        mergeMap(id => this.getArtworkById(id)),
        filter((artwork: Artwork) => Boolean(artwork.primaryImageSmall || artwork.primaryImage)),
        toArray()
      );
  }

  // 1S - method to Prevents unnecessary API calls for empty searches
  searchArtworks(query: string, limit: number = 20): Observable<Artwork[]> {
    if (!query.trim()) { // Checks if search query is empty after removing whitespace
      return of([]); // Return empty array if query is empty
    }
    
    // Get results from API and filter them to show only relevant matches
    // Calls the actual API search method
    return this.performSingleSearch(query, limit * 3).pipe(
      map(results => {
        // Filter results to only show artworks that actually match the search query
        const relevantResults = this.filterRelevantResults(results, query);
        return relevantResults.slice(0, limit);
      }),
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    );
  }

  // Filter results to only show artworks that actually match the search query
  private filterRelevantResults(artworks: Artwork[], query: string): Artwork[] {
    const queryLower = query.toLowerCase().trim();
    
    if (queryLower.length === 0) { // if query is empty, return all artworks
      return artworks;
    }
    
    // Split query into words for better matching
    // Splits query on any whitespace (spaces, tabs, etc.), Van Gogh" becomes ["van", "gogh"]
    const queryWords = queryLower.split(/\s+/).filter(word => word.length >= 2);
    
    return artworks.filter(artwork => {
      const title = (artwork.title || '').toLowerCase();
      const artist = (artwork.artistDisplayName || '').toLowerCase();
      const department = ((artwork as any).department || '').toLowerCase();
      const objectName = ((artwork as any).objectName || '').toLowerCase();
      const culture = ((artwork as any).culture || '').toLowerCase();
      const medium = ((artwork as any).medium || '').toLowerCase();
      
      // Check if any field contains the full query
      // Example: "van gogh" - checks if "van gogh" is present in any field
      const fullQueryMatch = 
        title.includes(queryLower) ||
        artist.includes(queryLower) ||
        department.includes(queryLower) ||
        objectName.includes(queryLower) ||
        culture.includes(queryLower) ||
        medium.includes(queryLower);
      
      // Check if any field contains all query words
      // Example: "van gogh" - checks if both "van" and "gogh" are present in any field
      const allWordsMatch = queryWords.every(word => 
        title.includes(word) ||
        artist.includes(word) ||
        department.includes(word) ||
        objectName.includes(word) ||
        culture.includes(word) ||
        medium.includes(word)
      );
      
      // Return true only if there's a meaningful match
      return fullQueryMatch || allWordsMatch;
    }).sort((a, b) => {
      // Sort by relevance - exact matches first
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      const aArtist = (a.artistDisplayName || '').toLowerCase();
      const bArtist = (b.artistDisplayName || '').toLowerCase();
      
      // Priority: exact title match > title contains > artist contains
      if (aTitle === queryLower) return -1;
      if (bTitle === queryLower) return 1;
      if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1;
      if (bTitle.includes(queryLower) && !aTitle.includes(queryLower)) return 1;
      if (aArtist.includes(queryLower) && !bArtist.includes(queryLower)) return -1;
      if (bArtist.includes(queryLower) && !aArtist.includes(queryLower)) return 1;
      
      return 0; // No change in order if no specific match found
    });
  }

  // Get individual artwork details by ID
  getArtworkById(id: number): Observable<Artwork> {
    return this.http.get<Artwork>(`${this.apiUrl}/objects/${id}`);
  }

  // Perform single search API call with caching prevention
  private performSingleSearch(searchTerm: string, limit: number): Observable<Artwork[]> {
    const params = `?q=${encodeURIComponent(searchTerm)}&hasImages=true`;
    
    return this.http
      .get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}&_t=${Date.now()}`)
      .pipe(
        map(res => {
          if (!res || !res.objectIDs || res.objectIDs.length === 0) {
            return [];
          }
          // Get more IDs to have a better selection after filtering
          return res.objectIDs.slice(0, Math.min(limit, 80));
        }),
        switchMap(ids => {
          if (ids.length === 0) {
            return of([]);
          }
          
          return from(ids).pipe(
            mergeMap(id => this.getArtworkById(id).pipe(
              catchError((error) => {
                return of(null);
              })
            ), 8), // Increase concurrent requests for better performance
            filter((artwork: Artwork | null): artwork is Artwork => {
              return artwork !== null && Boolean(artwork.primaryImageSmall || artwork.primaryImage);
            }),
            toArray()
          );
        }),
        catchError(error => {
          console.error(`Search error for "${searchTerm}":`, error);
          return of([]);
        })
      );
  }

  // Comments API methods
  getComments(itemId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.commentsUrl}?item_id=${itemId}`).pipe(
      catchError(error => {
        if (error.status === 400) {
          // 400 errors are expected for items without comments
          return of([]);
        }
        throw error;
      })
    );
  }

  // Likes API methods
  getLikes(itemId: string): Observable<Like> {
    return this.http.get<Like[]>(`${this.likesUrl}?item_id=${itemId}`).pipe(
      map(likes => {
        const itemLike = likes.find(like => like.item_id === itemId);
        return itemLike || { item_id: itemId, likes: 0 };
      })
    );
  }

  postLike(likeData: Like): Observable<Like> {
    return this.http.post<Like>(this.likesUrl, likeData).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 201 status as success (API quirk)
        if (error.status === 201) {
          return of(likeData);
        }
        throw error;
      })
    );
  }

  // Comments API methods
  postComment(commentData: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.commentsUrl, commentData).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 201 status as success (API quirk)
        if (error.status === 201) {
          return of(commentData);
        }
        // For other errors, re-throw them
        throw error;
      })
    );
  }
  
}