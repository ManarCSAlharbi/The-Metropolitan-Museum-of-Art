import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, filter, forkJoin, from, map, mergeMap, of, switchMap, toArray, catchError, delay } from 'rxjs';
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
  getArtworks(batchSize: number = 5): Observable<Artwork[]> {
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
  // Returns department ID and display name for each department
getDepartments(): Observable<DepartmentResponse> {
  return this.http.get<DepartmentResponse>(`${this.apiUrl}/departments`);
}

// Get artworks by department ID - using correct API endpoint
getDepartmentArtworks(departmentId: number): Observable<Artwork[]> {
  const timestamp = Date.now(); 
  console.log(`[${timestamp}] API: Fetching artworks for department ID: ${departmentId}`);
  
  // Use the /objects endpoint with departmentIds parameter (correct API usage)
  const url = `${this.apiUrl}/objects?departmentIds=${departmentId}`;
  console.log(`[${timestamp}] API: Making request to: ${url}`);
  
  return this.http.get<{ total: number, objectIDs: number[] }>(url)
    .pipe(
      switchMap(res => {
        console.log(`[${timestamp}] API: Received response for department ${departmentId}:`, res);
        if (!res.objectIDs || res.objectIDs.length === 0) {
          console.log(`[${timestamp}] API: No objects found for department ${departmentId}`);
          return of([]);
        }
        console.log(`[${timestamp}] API: Found ${res.objectIDs.length} objects for department ${departmentId}`);

        // Shuffle and limit to first 15 results for retry/randomization
        const shuffled = res.objectIDs.sort(() => Math.random() - 0.5); // Shuffle the IDs of artworks
        const ids = shuffled.slice(0, 15); // Limit to 15 IDs
        console.log(`[${timestamp}] API: Processing first ${ids.length} shuffled objects`);

        // Fetch in batches of 5 with delay between batches
        const batchSize = 5;
        const batches: number[][] = [];
        for (let i = 0; i < ids.length; i += batchSize) { // Create batches of 5
          batches.push(ids.slice(i, i + batchSize));
        }

        let allArtworks: (Artwork | null)[] = [];
        let batchIndex = 0;

        // Recursive function to fetch artworks in batches
        const fetchNextBatch = (): Observable<(Artwork | null)[]> => {
          if (batchIndex >= batches.length) {
            return of(allArtworks);
          }
          // Fetch the current batch
          const currentBatch = batches[batchIndex];
          batchIndex++;
        
          return forkJoin(currentBatch.map(id =>
            this.getArtworkById(id).pipe(
              catchError((error) => {
                console.warn(`[${timestamp}] API: Failed to fetch artwork ${id}:`, error.status);
                return of(null);
              })
            )
          )).pipe(
            switchMap(results => {
              allArtworks = allArtworks.concat(results); // Collect results from this batch
              if (batchIndex < batches.length) {

                // Delay 500ms between batches
                return of(null).pipe(
                  delay(500),
                  switchMap(() => fetchNextBatch())
                );
              } else {
                return of(allArtworks); // Return all collected artworks
              }
            })
          );
        };

        return fetchNextBatch().pipe(
          map(artworks => {
            const validArtworks = artworks
              .filter((artwork): artwork is Artwork =>
                artwork !== null &&
                Boolean(artwork.primaryImageSmall || artwork.primaryImage)
              );
            console.log(`[${timestamp}] API: Returning ${validArtworks.length} valid artworks for department ${departmentId}`);
            return validArtworks;
          })
        );
      }),
      catchError((error) => {
        console.error(`[${timestamp}] API: Error fetching department ${departmentId}:`, error);
        return of([]);
      })
    );
}


  
}