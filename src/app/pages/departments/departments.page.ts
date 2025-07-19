import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButton, 
  IonCard, 
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonButton, 
    IonCard, 
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonSpinner,
    IonText,
    CommonModule, 
    FormsModule
  ]
})
export class DepartmentsPage implements OnInit {
  departments: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.apiService.getDepartments().subscribe({
      next: (data: any) => {
        this.departments = data.departments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.error = 'Failed to load departments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToDepartmentObjects(departmentId: number, departmentName: string) {
    console.log(`Navigating to department: ${departmentName} (ID: ${departmentId})`);
    
    // Add timestamp to force route refresh
    this.router.navigate(['/department-objects', departmentId], {
      queryParams: { 
        name: departmentName,
        timestamp: Date.now() // Force refresh
      }
    });
  }

  onRetry() {
    this.isLoading = true;
    this.error = null;
    this.loadDepartments();
  }
}
