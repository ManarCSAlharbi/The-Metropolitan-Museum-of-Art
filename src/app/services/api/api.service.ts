import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, filter, forkJoin, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
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
@Injectable({ providedIn: 'root' })
export class ApiService {
private apiUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';

  /**
   * Fetches a batch of random artworks (default 10) each call.
   */
  /**
   * Fetches a batch of random artworks (default 10) each call.
   */
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


  getArtworkById(id: number): Observable<Artwork> {
    return this.http.get<Artwork>(`${this.apiUrl}/objects/${id}`);
  }

  

  constructor(private http: HttpClient) {}
  
}
