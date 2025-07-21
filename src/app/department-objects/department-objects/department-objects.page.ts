import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonBackButton, IonButtons, IonGrid, IonRow, IonCol,
  IonSpinner, IonText, IonButton
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ApiService, Artwork } from '../../services/api/api.service';
import { CardComponent } from '../../componants/card/card.component';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-department-objects',
  templateUrl: './department-objects.page.html',
  styleUrls: ['./department-objects.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonBackButton, IonButtons, IonGrid, IonRow, IonCol,
    IonSpinner, IonText, IonButton,
    CommonModule, FormsModule, CardComponent
  ]
})
export class DepartmentObjectsPage implements OnInit, OnDestroy {
  departmentId!: number; // Department ID from route parameters
  departmentName!: string; // Department name from query parameters
  artworks: Artwork[] = []; // Artworks to display
  isLoading = true; // Loading state
  error: string | null = null; // Error message if loading fails
  private routeSubscription?: Subscription; // Subscription for route changes
  private artworkSubscription?: Subscription; // Subscription for artwork loading

  constructor(
    private route: ActivatedRoute, // ActivatedRoute to access route parameters and query parameters
    private apiService: ApiService // ApiService to fetch artworks
  ) {}

  ngOnInit() {
    // Subscribe to both route parameters and query parameters
    // This allows us to react to changes in either the department ID or name
    this.routeSubscription = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ]).subscribe(([params, queryParams]) => {
      const newDepartmentId = +params.get('id')!;
      const newDepartmentName = queryParams.get('name') || '';
      
      console.log(`Route changed: Department ID: ${newDepartmentId}, Name: ${newDepartmentName}`);
      
      // Always update and reload when parameters change
      this.departmentId = newDepartmentId;
      this.departmentName = newDepartmentName;
      this.loadArtworks();
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.artworkSubscription) {
      this.artworkSubscription.unsubscribe();
    }
  }

  loadArtworks() {
    console.log(`Loading artworks for department ID: ${this.departmentId}, Name: ${this.departmentName}`);
    
    this.isLoading = true;
    this.error = null;
    this.artworks = []; // Clear previous artworks

    if (this.artworkSubscription) {
      this.artworkSubscription.unsubscribe();
    }
// Fetch artworks for the current department ID
    this.artworkSubscription = this.apiService.getDepartmentArtworks(this.departmentId).subscribe({
      next: (artworks) => {
        console.log(`Received ${artworks.length} artworks for department ${this.departmentId}`);
         // Filter artworks to ensure they have valid IDs and images
        this.artworks = artworks.filter(artwork => 
          artwork && 
          artwork.objectID && 
          artwork.title &&
          (artwork.primaryImageSmall || artwork.primaryImage)
        );
        
        console.log(`Filtered to ${this.artworks.length} valid artworks`);
        this.isLoading = false; // Set loading to false after artworks are loaded
        
        if (this.artworks.length === 0) {
          this.error = `No artworks found for ${this.departmentName}. This department might not have any available images.`;
        }
      },
      error: (error) => {
        console.error('Error loading artworks:', error);
        this.error = `Failed to load artworks for ${this.departmentName}. Please try again.`;
        this.isLoading = false;
      }
    });
  }

  onRetry() {
    this.loadArtworks();
  }
}