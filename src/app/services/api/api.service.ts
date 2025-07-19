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
  department?: string;
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

export interface Department {
  departmentId: number;
  displayName: string;
}

export interface DepartmentResponse {
  departments: Department[];
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

  // Search artworks by query
  searchArtworks(query: string): Observable<Artwork[]> {
    if (!query.trim()) {
      return of([]);
    }
    const params = `?q=${encodeURIComponent(query)}&hasImages=true`;
    return this.http.get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}`).pipe(
      switchMap(res => {
        if (!res.objectIDs || res.objectIDs.length === 0) {
          return of([]);
        }
        // Limit to first 20 results for performance
        const ids = res.objectIDs.slice(0, 5);
        return forkJoin(ids.map(id => this.http.get<Artwork>(`${this.apiUrl}/objects/${id}`)));
      }),
      map(artworks => artworks.filter(a => a.primaryImageSmall || a.primaryImage)),
      catchError(() => of([]))
    );
  }

  // Get individual artwork details by ID
  getArtworkById(id: number): Observable<Artwork> {
    return this.http.get<Artwork>(`${this.apiUrl}/objects/${id}`).pipe(
      catchError((error) => {
        // Log the error but don't throw - let the caller handle it
        console.warn(`Failed to fetch artwork ${id}: ${error.status} ${error.statusText}`);
        throw error; // Re-throw so the caller's catchError can handle it
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

  // Get all departments from Metropolitan Museum API
getDepartments(): Observable<DepartmentResponse> {
  return this.http.get<DepartmentResponse>(`${this.apiUrl}/departments`);
}

// Get artworks by department ID - using the correct API endpoint
getDepartmentArtworks(departmentId: number): Observable<Artwork[]> {
  // Use the correct Metropolitan Museum API approach
  // First try the departmentId parameter in search (some work, some don't)
  return this.http.get<{ objectIDs: number[] }>(`${this.apiUrl}/search?departmentId=${departmentId}&hasImages=true`)
    .pipe(
      switchMap(res => {
        if (!res.objectIDs || res.objectIDs.length === 0) {
          console.log(`No objects found for department ${departmentId} using departmentId parameter`);
          // Fallback to search terms approach
          return this.searchByDepartmentTerms(departmentId);
        }
        
        console.log(`Found ${res.objectIDs.length} objects for department ${departmentId}`);
        // Limit to first 15 for performance
        const ids = res.objectIDs.slice(0, 15);
        
        return forkJoin(ids.map(id => 
          this.getArtworkById(id).pipe(
            catchError((error) => {
              console.warn(`Failed to fetch artwork ${id}:`, error.status);
              return of(null);
            })
          )
        )).pipe(
          map(artworks => {
            const validArtworks = artworks
              .filter((artwork): artwork is Artwork => 
                artwork !== null && 
                Boolean(artwork.primaryImageSmall || artwork.primaryImage)
              );
            
            console.log(`Successfully loaded ${validArtworks.length} artworks for department ${departmentId}`);
            return validArtworks;
          })
        );
      }),
      catchError((error) => {
        console.error(`Error with departmentId=${departmentId}, trying search terms:`, error);
        return this.searchByDepartmentTerms(departmentId);
      })
    );
}

// Secondary method using search terms (fallback)
private searchByDepartmentTerms(departmentId: number): Observable<Artwork[]> {
  const departmentSearchTerms = this.getDepartmentSearchTerms(departmentId);
  console.log(`Using search terms "${departmentSearchTerms}" for department ${departmentId}`);
  
  return this.http.get<{ objectIDs: number[] }>(`${this.apiUrl}/search?q=${encodeURIComponent(departmentSearchTerms)}&hasImages=true`)
    .pipe(
      switchMap(res => {
        if (!res.objectIDs || res.objectIDs.length === 0) {
          console.log(`No artworks found with search terms, using general fallback`);
          return this.getFallbackArtworks(departmentId);
        }
        
        const ids = res.objectIDs.slice(0, 10);
        return forkJoin(ids.map(id => 
          this.getArtworkById(id).pipe(
            catchError(() => of(null))
          )
        )).pipe(
          map(artworks => artworks.filter((artwork): artwork is Artwork => 
            artwork !== null && Boolean(artwork.primaryImageSmall || artwork.primaryImage)
          ))
        );
      }),
      catchError(() => this.getFallbackArtworks(departmentId))
    );
}

// Helper method to get search terms by department ID
private getDepartmentSearchTerms(departmentId: number): string {
  const departmentSearchMap: { [key: number]: string } = {
    1: 'american decorative',
    3: 'ancient near eastern',
    4: 'armor weapons',
    5: 'african oceania americas',
    6: 'asian art china japan',
    7: 'medieval cloisters',
    8: 'costume fashion dress',
    9: 'drawings prints',
    10: 'egyptian ancient egypt',
    11: 'european paintings',
    12: 'european sculpture decorative',
    13: 'greek roman classical',
    14: 'islamic art',
    15: 'lehman collection',
    16: 'manuscripts books',
    17: 'medieval art',
    18: 'musical instruments',
    19: 'photographs',
    20: 'modern contemporary',
    21: 'paintings european'
  };
  return departmentSearchMap[departmentId] || 'painting';
}

// Fallback method for when department search fails
private getFallbackArtworks(departmentId: number): Observable<Artwork[]> {
  console.log(`Using fallback method for department ${departmentId}`);
  // Return a subset of general artworks as fallback
  return this.getArtworks(8); // Get 8 random artworks
}


  
}