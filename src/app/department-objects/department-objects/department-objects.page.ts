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
import { Subscription } from 'rxjs';

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
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const newDepartmentId = +params.get('id')!;
      const newDepartmentName = this.route.snapshot.queryParamMap.get('name') || '';
      
      if (newDepartmentId !== this.departmentId) {
        this.departmentId = newDepartmentId;
        this.departmentName = newDepartmentName;
        this.loadArtworks();
      }
    });
    
    this.departmentId = +this.route.snapshot.paramMap.get('id')!;
    this.departmentName = this.route.snapshot.queryParamMap.get('name') || '';
    this.loadArtworks();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadArtworks() {
    this.isLoading = true;
    this.error = null;
    this.artworks = [];

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.apiService.getDepartmentArtworks(this.departmentId).subscribe({
      next: (artworks) => {
        this.artworks = artworks.filter(artwork => 
          artwork && 
          artwork.objectID && 
          artwork.title &&
          (artwork.primaryImageSmall || artwork.primaryImage)
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading artworks:', error);
        this.error = 'Failed to load artworks. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onRetry() {
    this.loadArtworks();
  }
}