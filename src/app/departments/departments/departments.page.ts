import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonGrid, IonRow, IonCol, IonButton, IonCard, 
  IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner, IonText, IonList, IonLabel, IonItem } from '@ionic/angular/standalone';
import { ApiService, Department } from '../../services/api/api.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  imports: [IonItem, IonLabel, IonList, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonSpinner, IonText, CommonModule,IonButton
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

  private loadDepartments() { // Fetch departments from the API
    this.apiService.getDepartments().subscribe({
      next: (response) => {
        console.log('Departments loaded successfully:', response.departments); // Log the loaded departments
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

  // Navigate to the department objects page with the selected department ID
  navigateToDepartment(department: Department) {
    console.log(`Navigating to department: ${department.displayName} (ID: ${department.departmentId})`);
    // Use the router to navigate to the department objects page
    this.router.navigate(['/department-objects', department.departmentId], {
      // Pass the department name as a query parameter for display purposes
      queryParams: { 
        name: department.displayName,
        timestamp: Date.now() 
      }
    }).then(success => { // Log the success of the navigation
      console.log(`Navigation successful: ${success}`);
    }).catch(error => { // Log any errors during navigation
      console.error('Navigation error:', error);
    });
  }
  // Retry loading departments on error
  onRetry() {
    this.isLoading = true; // Reset loading state
    this.error = null; // Reset error state
    this.loadDepartments();
  }

trackByDepartmentId(index: number, department: Department): number {
  return department.departmentId;
}

}
