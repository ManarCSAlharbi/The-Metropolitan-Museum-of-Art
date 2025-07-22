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
  objectURL?: string; // URL to the artwork's page on the Met Museum website
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
  getArtworks(batchSize: number = 3): Observable<Artwork[]> {
    const params = '?q=painting&hasImages=true';
    return this.http
      .get<{ objectIDs: number[] }>(`${this.apiUrl}/search${params}`)
      .pipe(
        delay(1000), // Add 1 second delay after getting search results
        map(res => {
          const shuffled = res.objectIDs.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, batchSize);
        }),
        switchMap(ids => {
          // Fetch artworks one by one with delays instead of all at once
          return from(ids).pipe(
            mergeMap((id, index) => 
              this.getArtworkById(id).pipe(
                delay(index * 1500), // Wait 1.5 seconds between each request
                catchError(() => of(null)) // If one fails, continue with others
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
      delay(500), // Add 500ms delay to each individual request
      map((artwork: Artwork) => ({
        ...artwork,
        // Add the URL to each artwork
        objectURL: `https://www.metmuseum.org/art/collection/search/${artwork.objectID}`
      })),
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

  // Get all departments 
  // Returns department ID and display name for each department
getDepartments(): Observable<DepartmentResponse> {
  return this.http.get<DepartmentResponse>(`${this.apiUrl}/departments`);
}

  // Get artworks for a specific department
  // Fetches artworks in batches of 5, with a delay between batches to avoid overwhelming the API
  // Returns an array of Artwork objects for the specified department ID
getDepartmentArtworks(departmentId: number): Observable<Artwork[]> {
  const timestamp = Date.now(); // Add timestamp for logging
  console.log(`[${timestamp}] API: Fetching artworks for department ID: ${departmentId}`);
  
  // Creates the URL to ask the Met Museum API for all objects in a specific department
  // Note: The API endpoint is /objects?departmentIds=ID, this part is a query parameter that filters by department
  const url = `${this.apiUrl}/objects?departmentIds=${departmentId}`;
  console.log(`[${timestamp}] API: Making request to: ${url}`);
  
  // Make the HTTP GET request to fetch objects in the specified department
  // Example response: { total: 5000, objectIDs: [12345, 67890, 11111, ...] }
  return this.http.get<{ total: number, objectIDs: number[] }>(url)
  // Process the response
    .pipe(
      switchMap(res => { // Use switchMap to handle the response, transforming it
        console.log(`[${timestamp}] API: Received response for department ${departmentId}:`, res);
        if (!res.objectIDs || res.objectIDs.length === 0) { // If no artworks exist, return an empty array 
          console.log(`[${timestamp}] API: No objects found for department ${departmentId}`);
          return of([]);
        }
        // Log the number of objects found in the department
        console.log(`[${timestamp}] API: Found ${res.objectIDs.length} objects for department ${departmentId}`);

        // --- Shuffle and limit to first 15 results for retry/randomization
        // Shuffle the IDs of artworks to randomize the selection
        // randomly reorders the array
        const shuffled = res.objectIDs.sort(() => Math.random() - 0.5); // Shuffle the IDs of artworks
        const ids = shuffled.slice(0, 15); //takes only the first 15 IDs to avoid overwhelming the API
        console.log(`[${timestamp}] API: Processing first ${ids.length} shuffled objects`);

        // Fetch in batches of 3 with delay between batches (reduced to avoid API blocking)
        // Create batches of 3 IDs to fetch artworks in smaller groups
        const batchSize = 3;
        const batches: number[][] = []; 
        
        for (let i = 0; i < ids.length; i += batchSize) { // Create batches of 3
          batches.push(ids.slice(i, i + batchSize)); 
        }

        let allArtworks: (Artwork | null)[] = []; // Array to collect all artworks fetched
        let batchIndex = 0; // Index to track which batch we're currently fetching

        // Recursive function to fetch artworks in batches
        // is a function that processes one batch at a time 
        const fetchNextBatch = (): Observable<(Artwork | null)[]> => {
          if (batchIndex >= batches.length) { // If we've processed all batches
            return of(allArtworks); // done fetching all batches
          }
          
          const currentBatch = batches[batchIndex]; // Get the current batch of IDs
          batchIndex++; // Move to the next batch for the next call
        
          // forkJoin makes multiple API calls at the same time and waits for all to complete
          return forkJoin(currentBatch.map(id => 
            // For each ID in the current batch, fetch the artwork details
            this.getArtworkById(id).pipe( 

              catchError((error) => {
                console.warn(`[${timestamp}] API: Failed to fetch artwork ${id}:`, error.status);
                return of(null);
              })
            )
          )).pipe( 
            switchMap(results => {
              allArtworks = allArtworks.concat(results); // adds the current batch results to our collection
              // If more batches remain, wait 2000ms (2 seconds) to avoid API blocking
              if (batchIndex < batches.length) {
                // Delay 2000ms between batches
                return of(null).pipe(
                  delay(2000),
                  switchMap(() => fetchNextBatch()) // Recursively fetch the next batch
                );
              } else { // If no more batches, return all collected artworks
                return of(allArtworks); 
              }
            })
          );
        };

        return fetchNextBatch().pipe( 
          // Filter out any null values (failed requests)
          map(artworks => {
            const validArtworks = artworks
              .filter((artwork): artwork is Artwork =>
                artwork !== null &&
                Boolean(artwork.primaryImageSmall || artwork.primaryImage)
              );
            console.log(`[${timestamp}] API: Returning ${validArtworks.length} valid artworks for department ${departmentId}`);
            return validArtworks; // Return only valid artworks
          })
        );
      }),
      // If anything goes wrong with the entire process, log the error
      catchError((error) => {
        console.error(`[${timestamp}] API: Error fetching department ${departmentId}:`, error);
        return of([]);
      })
    );
}


  
}