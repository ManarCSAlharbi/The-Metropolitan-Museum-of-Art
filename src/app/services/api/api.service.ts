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
  objectURL?: string;
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
  getArtworks(batchSize: number = 3): Observable<Artwork[]> {
    const params = '?q=painting&hasImages=true';
    return this.http
      .get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}`)
      .pipe(
        delay(1000),
        map(res => {
          const shuffled = res.objectIDs.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, batchSize);
        }),
        switchMap(ids => {
          return from(ids).pipe(
            mergeMap((id, index) => 
              this.getArtworkById(id).pipe(
                delay(index * 1500),
                catchError(() => of(null))
              )
            ),
            filter((artwork): artwork is Artwork => artwork !== null),
            toArray()
          );
        })
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
        // Limit to first 5 results for performance
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
      delay(500),
      map((artwork: Artwork) => ({
        ...artwork,
        objectURL: `https://www.metmuseum.org/art/collection/search/${artwork.objectID}`
      })),
      catchError((error) => {
        console.warn(`Failed to fetch artwork ${id}: ${error.status} ${error.statusText}`);
        throw error;
      })
    );
  }

  // Comments API methods
  getComments(itemId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.commentsUrl}?item_id=${itemId}`).pipe(
      catchError(error => {
        if (error.status === 400) {
          return of([]);
        }
        throw error;
      })
    );
  }

  postComment(commentData: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.commentsUrl, commentData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 201) {
          return of(commentData);
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
        if (error.status === 201) {
          return of(likeData);
        }
        throw error;
      })
    );
  }

  // Get all departments
  getDepartments(): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.apiUrl}/departments`);
  }

  // Get artworks for a specific department
  getDepartmentArtworks(departmentId: number): Observable<Artwork[]> {
    const url = `${this.apiUrl}/objects?departmentIds=${departmentId}`;
    
    return this.http.get<{ total: number, objectIDs: number[] }>(url)
      .pipe(
        switchMap(res => {
          if (!res.objectIDs || res.objectIDs.length === 0) {
            return of([]);
          }

          // Shuffle and limit to first 15 results
          const shuffled = res.objectIDs.sort(() => Math.random() - 0.5);
          const ids = shuffled.slice(0, 15);

          return this.fetchArtworksInBatches(ids);
        }),
        catchError((error) => {
          console.error(`Error fetching department ${departmentId}:`, error);
          return of([]);
        })
      );
  }

  // Fetch artworks in batches to avoid API rate limits
  private fetchArtworksInBatches(ids: number[]): Observable<Artwork[]> {
    const batchSize = 3;
    const batches: number[][] = [];
    
    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }

    let allArtworks: (Artwork | null)[] = [];
    let batchIndex = 0;

    const fetchNextBatch = (): Observable<(Artwork | null)[]> => {
      if (batchIndex >= batches.length) {
        return of(allArtworks);
      }
      
      const currentBatch = batches[batchIndex];
      batchIndex++;
    
      return forkJoin(currentBatch.map(id => 
        this.getArtworkById(id).pipe(
          catchError((error) => {
            console.warn(`Failed to fetch artwork ${id}:`, error.status);
            return of(null);
          })
        )
      )).pipe(
        switchMap(results => {
          allArtworks = allArtworks.concat(results);
          
          if (batchIndex < batches.length) {
            return of(null).pipe(
              delay(2000),
              switchMap(() => fetchNextBatch())
            );
          } else {
            return of(allArtworks);
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
        return validArtworks;
      })
    );
  }
}