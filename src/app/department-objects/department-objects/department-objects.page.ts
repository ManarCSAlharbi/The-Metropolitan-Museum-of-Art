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
  departmentId!: number;
  departmentName!: string;
  artworks: Artwork[] = [];
  isLoading = true;
  error: string | null = null;
  private routeSubscription?: Subscription;
  private artworkSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Subscribe to both route parameters and query parameters
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

    this.artworkSubscription = this.apiService.getDepartmentArtworks(this.departmentId).subscribe({
      next: (artworks) => {
        console.log(`Received ${artworks.length} artworks for department ${this.departmentId}`);
        
        this.artworks = artworks.filter(artwork => 
          artwork && 
          artwork.objectID && 
          artwork.title &&
          (artwork.primaryImageSmall || artwork.primaryImage)
        );
        
        console.log(`Filtered to ${this.artworks.length} valid artworks`);
        this.isLoading = false;
        
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