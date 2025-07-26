import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/angular/standalone';
import { CardComponent } from '../componants/card/card.component';
import { ApiService, Artwork } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, 
    IonGrid, IonRow, IonCol, IonSpinner,
    CardComponent, CommonModule, FormsModule
  ]
})
export class SearchPage implements OnInit, OnDestroy {
  searchTerm: string = '';
  artworks: Artwork[] = [];
  isLoading: boolean = false;
  
  // Search management
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Set up reactive search with debouncing
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      distinctUntilChanged(), // Ignore duplicate search terms
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
  

