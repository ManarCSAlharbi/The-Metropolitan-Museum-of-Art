import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/angular/standalone';
import { CardComponent } from '../componants/card/card.component';
import { ApiService, Artwork } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, switchMap, debounceTime, distinctUntilChanged, of, Subscription, map } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, 
    IonGrid, IonRow, IonCol, IonSpinner,
    CardComponent, CommonModule, FormsModule,
  ]
})
export class SearchPage implements OnInit, OnDestroy {
  searchTerm: string = '';
  artworks: Artwork[] = [];
  isLoading: boolean = false;
  private allArtworks: Artwork[] = [];
  
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupSearchSubscription();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubject.complete();
  }

  private setupSearchSubscription() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.trim().length === 0) {
          this.isLoading = false;
          this.allArtworks = [];
          return of([]);
        }
        this.isLoading = true;
        return this.searchArtworks(term);
      })
    ).subscribe({
      next: (results) => {
        this.artworks = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.artworks = [];
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any) {
    const newSearchTerm = event.target.value || '';
    this.searchTerm = newSearchTerm;
    this.searchSubject.next(this.searchTerm);
  }

  private searchArtworks(term: string): Observable<Artwork[]> {
    return this.apiService.searchArtworks(term, 100).pipe(
      map(artworks => {
        this.allArtworks = artworks;
        return this.filterArtworksComprehensively(artworks, term);
      })
    );
  }

  private filterArtworksComprehensively(artworks: Artwork[], searchTerm: string): Artwork[] {
    const term = searchTerm.toLowerCase().trim();
    
    // Single comprehensive search - if term appears anywhere in artwork, include it
    return artworks.filter(artwork => {
      return this.searchInObjectExtensive(artwork, term);
    });
  }

  private searchInObjectExtensive(obj: any, searchTerm: string): boolean {
    if (!obj) return false;
    
    if (typeof obj === 'string') {
      const text = obj.toLowerCase();
      
      // Direct substring match (most important)
      if (text.includes(searchTerm)) return true;
      
      // Word matches
      const words = text.split(/[\s,.-_()]+/).filter(w => w.length > 0);
      return words.some(word => 
        word.includes(searchTerm) || 
        searchTerm.includes(word) ||
        word.startsWith(searchTerm) || 
        word.endsWith(searchTerm)
      );
    }
    
    if (typeof obj === 'number') {
      const numStr = obj.toString();
      return numStr.includes(searchTerm) || 
             numStr.startsWith(searchTerm) || 
             numStr.endsWith(searchTerm);
    }
    
    if (typeof obj === 'boolean') {
      return obj.toString().toLowerCase().includes(searchTerm);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => this.searchInObjectExtensive(item, searchTerm));
    }
    
    if (typeof obj === 'object') {
      // Search in all object properties including nested ones
      return Object.entries(obj).some(([key, value]) => {
        // Search in property names as well
        if (key.toLowerCase().includes(searchTerm)) return true;
        
        // Search in property values recursively
        return this.searchInObjectExtensive(value, searchTerm);
      });
    }
    
    return false;
  }

  clearSearch() {
    this.searchTerm = '';
    this.artworks = [];
    this.allArtworks = [];
    this.isLoading = false;
    this.searchSubject.next('');
  }
}
    



