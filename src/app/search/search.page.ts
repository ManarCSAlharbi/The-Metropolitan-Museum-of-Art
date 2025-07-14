import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/angular/standalone';
import { CardComponent } from '../componants/card/card.component';
import { ApiService, Artwork } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';



@Component({
  selector: 'app-search', // Changed from app-tab2 to app-search
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, 
    IonGrid, IonRow, IonCol, IonSpinner,
    CardComponent, CommonModule, FormsModule,
     
  ]
})
export class SearchPage implements OnInit, OnDestroy { // Changed from Tab2Page to SearchPage
  searchTerm: string = '';   // Current search input, bound to the template
  artworks: Artwork[] = []; // Search results
  isLoading: boolean = false; // Loading state
  
  // Search management
  private searchSubject = new Subject<string>(); // RxJS subject for reactive search
  private searchSubscription?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Wait for 500ms pause in events
      distinctUntilChanged(), // Ignore if next search term is same as previous
      switchMap(term => {
        if (!term.trim()) {
          this.artworks = [];
          return []; // Return empty observable if term is empty
        }
        this.isLoading = true;
        return this.apiService.searchArtworks(term);
      })
    ).subscribe({
      next: (results) => {
        this.artworks = results;
        this.isLoading = false;
      },
      error: () => {
        this.artworks = [];
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  // Pushes the current search term to the search subject
  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }
}
  

