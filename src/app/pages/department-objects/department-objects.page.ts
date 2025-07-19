import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonBackButton, 
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonButton
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { CardComponent } from '../../componants/card/card.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-department-objects',
  templateUrl: './department-objects.page.html',
  styleUrls: ['./department-objects.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonBackButton, 
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonText,
    IonButton,
    CommonModule, 
    FormsModule,
    CardComponent
  ]
})
export class DepartmentObjectsPage implements OnInit, OnDestroy {
  departmentId!: number;
  departmentName!: string;
  artworks: any[] = [];
  isLoading = true;
  loadingProgress = 0;
  totalExpected = 0;
  error: string | null = null;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    console.log('DepartmentObjectsPage ngOnInit called');
    
    // Subscribe to route parameter changes to handle navigation between departments
    this.route.paramMap.subscribe(params => {
      const newDepartmentId = +params.get('id')!;
      const newDepartmentName = this.route.snapshot.queryParamMap.get('name') || '';
      
      // Only reload if department actually changed
      if (newDepartmentId !== this.departmentId) {
        this.departmentId = newDepartmentId;
        this.departmentName = newDepartmentName;
        
        console.log(`Department changed to: ${this.departmentName} (ID: ${this.departmentId})`);
        this.loadArtworks();
      }
    });
    
    // Initial load
    this.departmentId = +this.route.snapshot.paramMap.get('id')!;
    this.departmentName = this.route.snapshot.queryParamMap.get('name') || '';
    
    console.log(`Initial load for department: ${this.departmentName} (ID: ${this.departmentId})`);
    this.loadArtworks();
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadArtworks() {
    console.log(`Starting to load ALL artworks for department ${this.departmentId}`);
    
    // Reset state
    this.isLoading = true;
    this.error = null;
    this.artworks = [];
    this.loadingProgress = 0;
    this.totalExpected = 0;
    
    // Unsubscribe from previous request if exists
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    this.subscription = this.departmentsService.getDepartmentArtworks(this.departmentId).subscribe({
      next: (artworks: any[]) => {
        console.log(`Progressive update: received ${artworks.length} artworks so far`);
        
        // Update artworks progressively as they load
        this.artworks = artworks.filter(artwork => 
          artwork && 
          artwork.objectID && 
          artwork.title
        );
        
        this.loadingProgress = this.artworks.length;
        
        // If we're getting a final result (scan emits multiple times)
        console.log(`Current display count: ${this.artworks.length} artworks`);
      },
      complete: () => {
        console.log(`Loading complete! Final count: ${this.artworks.length} artworks`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading artworks:', error);
        this.error = 'Failed to load artworks. Please try again.';
        this.isLoading = false;
        this.artworks = [];
      }
    });
  }

  onRetry() {
    console.log('Retry button clicked');
    this.loadArtworks();
  }
}
