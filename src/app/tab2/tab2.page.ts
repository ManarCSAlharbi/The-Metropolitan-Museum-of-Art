import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/angular/standalone';
import { CardComponent } from '../componants/card/card.component';
import { ApiService, Artwork } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, switchMap, debounceTime, distinctUntilChanged, of, Subscription } from 'rxjs';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, 
    IonGrid, IonRow, IonCol, IonSpinner,
    CardComponent, CommonModule, FormsModule
  ]
})
export class Tab2Page implements OnInit, OnDestroy {
  searchTerm: string = '';
  artworks: Artwork[] = [];
  isLoading: boolean = false;
  
  // Search management
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

  // Configure reactive search with debouncing
  private setupSearchSubscription() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Wait for user to stop typing
      distinctUntilChanged(), // Only emit if value changed
      switchMap(term => {
        if (term.trim().length === 0) {
          this.isLoading = false;
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

  // Handle search input changes
  onSearchChange(event: any) {
    const newSearchTerm = event.target.value || '';
    this.searchTerm = newSearchTerm;
    this.searchSubject.next(this.searchTerm);
  }

  // Execute search via API service
  private searchArtworks(term: string): Observable<Artwork[]> {
    return this.apiService.searchArtworks(term, 20);
  }

  // Clear search results and input
  clearSearch() {
    this.searchTerm = '';
    this.artworks = [];
    this.isLoading = false;
    this.searchSubject.next('');
  }
}
