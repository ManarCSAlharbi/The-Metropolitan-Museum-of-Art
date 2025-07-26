import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonSpinner, IonText, IonList, IonLabel, IonItem, IonButton 
} from '@ionic/angular/standalone';
import { ApiService, Department } from '../../services/api/api.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  imports: [
    IonItem, IonLabel, IonList, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonSpinner, IonText, CommonModule, IonButton
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

  // Fetch departments from the API
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

  // Navigate to department objects page
  navigateToDepartment(department: Department) {
    this.router.navigate(['/department-objects', department.departmentId], {
      queryParams: { name: department.displayName }
    });
  }

  // Retry loading departments on error
  onRetry() {
    this.isLoading = true;
    this.error = null;
    this.loadDepartments();
  }

trackByDepartmentId(index: number, department: Department): number {
  return department.departmentId;
}

}
