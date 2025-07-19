import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonGrid, IonRow, IonCol, IonButton, IonCard, 
  IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner, IonText
} from '@ionic/angular/standalone';
import { ApiService, Department } from '../../services/api/api.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonGrid, IonRow, IonCol, IonButton, IonCard,
    IonCardContent, IonCardHeader, IonCardTitle,
    IonSpinner, IonText, CommonModule
  ]
})
export class DepartmentsPage implements OnInit {
  departments: Department[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  private loadDepartments() {
    this.apiService.getDepartments().subscribe({
      next: (response) => {
        this.departments = response.departments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.error = 'Failed to load departments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToDepartment(department: Department) {
    this.router.navigate(['/department-objects', department.departmentId], {
      queryParams: { 
        name: department.displayName,
        timestamp: Date.now()
      }
    });
  }

  onRetry() {
    this.isLoading = true;
    this.error = null;
    this.loadDepartments();
  }
}