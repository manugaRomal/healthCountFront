import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HealthService } from '../../services/health.service';
import { AuthService } from '../../services/auth.service';
import { HealthData } from '../../models/health-data.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userEmail: string = '';
  healthData: HealthData[] = [];
  isLoading = false;
  
  // Modal state
  isModalOpen = false;
  selectedAppType = '';

  constructor(
    private router: Router,
    private healthService: HealthService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail() || '';
    
    
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        this.loadHealthData();
      } else {
        // You need to provide the clienta key and email here
        // These should come from your clienta integration
        const clientaKey = 'your-clienta-integration-key'; // Replace with actual key
        const clientaEmail = 'user@example.com'; // Replace with actual email or get from clienta
        
        this.authService.ensureValidSession(clientaKey, clientaEmail);
      }
    });
  }

  goToUpload(): void {
    this.router.navigate(['/upload']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }


  loadHealthData(): void {
    this.isLoading = true;
    this.healthService.getHealthData().subscribe({
      next: (data: HealthData[]) => {
        this.healthData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading health data:', error);
        this.isLoading = false;
      }
    });
  }

  getTotalSteps(): number {
    return this.healthData.reduce((total, data) => total + (data.steps || 0), 0);
  }

  getTotalCalories(): number {
    return this.healthData.reduce((total, data) => total + (data.calories || 0), 0);
  }

  getAverageSteps(): number {
    if (this.healthData.length === 0) return 0;
    return this.getTotalSteps() / this.healthData.length;
  }

  getAverageCalories(): number {
    if (this.healthData.length === 0) return 0;
    return this.getTotalCalories() / this.healthData.length;
  }

  convertCaloriesToKcal(calories: number | null): number {
    if (!calories) return 0;
    return calories / 1000;
  }

  formatCalories(calories: number | null): string {
    if (!calories) return '0';
    return calories.toLocaleString();
  }

  formatKcal(calories: number | null): string {
    if (!calories) return '0.00';
    return this.convertCaloriesToKcal(calories).toFixed(2);
  }

  // Modal methods
  openScreenshotModal(appType: string): void {
    this.selectedAppType = appType;
    this.isModalOpen = true;
  }

  closeScreenshotModal(): void {
    this.isModalOpen = false;
    this.selectedAppType = '';
  }
}
