import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/angular/standalone';
import { CardComponent } from '../componants/card/card.component';
import { ApiService, Artwork } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, switchMap, debounceTime, distinctUntilChanged, of, Subscription } from 'rxjs';


@Component({
  selector: 'app-search', // Changed from app-tab2 to app-search
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, 
    IonGrid, IonRow, IonCol, IonSpinner,
    CardComponent, CommonModule, FormsModule
  ]
})
export class SearchPage implements OnInit, OnDestroy { // Changed from Tab2Page to SearchPage
  searchTerm: string = '';   // Current search input
  artworks: Artwork[] = []; // Search results
  isLoading: boolean = false; // Loading state
  
  // Search management
  private searchSubject = new Subject<string>(); // RxJS subject for reactive search
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
      // Example: User types "Van Gogh" - only searches after they stop typing for 300ms
      distinctUntilChanged(), // Only emit if value changed 
      // If user types "Van", deletes it, then types "Van" again - skips the duplicate
      switchMap(term => {
        // If search term is empty, reset state
        if (term.trim().length === 0) {
          this.isLoading = false; // Turns off loading spinner
          return of([]); // Return empty array to clear results
        }
        this.isLoading = true; //otherwise turns on loading spinner
        return this.searchArtworks(term); 
        
      })
    ).subscribe({ //starts the pipeline and handles results
      next: (results) => {
        // Handler for successful API responses
        this.artworks = results; // Updates the UI with search results
        this.isLoading = false; // Hides loading spinner
      },
      error: (error) => {
        // Handle Search Error
        console.error('Search error:', error);
        this.artworks = []; // Clear results on error
        this.isLoading = false; // Hides loading spinner
      }
    });
  }

  // Handle search input changes
  onSearchChange(event: any) {
    const newSearchTerm = event.target.value || '';  //Extract Search Value (input, ex="van Gogh")
    this.searchTerm = newSearchTerm; // store extracted value in searchTerm (input, ex="van Gogh")
    this.searchSubject.next(this.searchTerm); // Emit new search term to trigger search --API call
  }

  // Execute search via API service
  // This method calls the API service to search artworks based on the term
  private searchArtworks(term: string): Observable<Artwork[]> {
    return this.apiService.searchArtworks(term, 20); // CALL the API service to search artworks 
    // with a limit of 20 results
  }

  // Clear search results and input
  clearSearch() {
    this.searchTerm = '';
    this.artworks = [];
    this.isLoading = false;
    this.searchSubject.next('');
  }
}
