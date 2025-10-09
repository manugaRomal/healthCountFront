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

  constructor(
    private router: Router,
    private healthService: HealthService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail() || '';
    
    // Check for token in URL (for Clienta integration)
    this.authService.checkForUrlToken();
    
    if (this.authService.isAuthenticated()) {
      this.loadHealthData();
    }
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

  getTotalCalories(): number {
    return this.healthData.reduce((total, data) => total + (data.calories || 0), 0);
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
}
