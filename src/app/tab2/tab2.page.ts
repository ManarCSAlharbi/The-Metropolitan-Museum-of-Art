import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/angular/standalone';
import { CardComponent } from '../componants/card/card.component';
import { ApiService, Artwork } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, switchMap, debounceTime, distinctUntilChanged, of } from 'rxjs';


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
export class Tab2Page {
  searchTerm: string = '';
  artworks: Artwork[] = [];
  isLoading: boolean = false;
  private searchSubject = new Subject<string>();

  constructor(private apiService: ApiService) {
    // Set up search with debounce
    this.searchSubject.pipe(
      debounceTime(300), // Reduced wait time for better responsiveness
      distinctUntilChanged(), // Only emit if value changed
      switchMap(term => {
        if (term.trim().length === 0) {
          return of([]);
        }
        return this.searchArtworks(term);
      })
    ).subscribe(results => {
      console.log('Search results received:', results);
      console.log('Number of artworks:', results.length);
      if (results.length > 0) {
        console.log('First artwork sample:', results[0]);
        console.log('First artwork objectID:', results[0]?.objectID);
      }
      this.artworks = results;
      this.isLoading = false;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    if (this.searchTerm.trim().length > 0) {
      this.isLoading = true;
    }
    this.searchSubject.next(this.searchTerm);
  }

  private searchArtworks(term: string): Observable<Artwork[]> {
    // Use fewer results for more targeted search
    return this.apiService.searchArtworks(term, 15);
  }

  clearSearch() {
    this.searchTerm = '';
    this.artworks = [];
    this.isLoading = false;
  }
}
