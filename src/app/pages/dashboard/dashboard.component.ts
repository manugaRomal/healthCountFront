import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HealthService } from '../../services/health.service';
import { AuthService } from '../../services/auth.service';
import { HealthData, UploadProgress, TotalStats } from '../../models/health-data.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  healthData: HealthData[] = [];
  totalStats: TotalStats | null = null;
  isLoading = true;
  username = '';

  constructor(
    private healthService: HealthService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get user email from JWT token using AuthService
    this.username = this.authService.getUserEmail() || 'user';
    
    // Check for token in URL (for Clienta integration)
    this.authService.checkForUrlToken();
    
    this.loadHealthData();
  }

  loadHealthData(): void {
    this.isLoading = true;
    this.healthService.getHealthData().subscribe({
      next: (data: HealthData[]) => {
        this.healthData = data;
        this.totalStats = this.calculateTotalStats(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading health data:', error);
        this.isLoading = false;
      }
    });
  }


  calculateTotalStats(data: HealthData[]): TotalStats {
    const validUploads = data.filter(d => d.steps !== null || d.calories !== null);
    const totalUploads = validUploads.length;
    const totalSteps = validUploads.reduce((sum, d) => sum + (d.steps || 0), 0);
    const totalCalories = validUploads.reduce((sum, d) => sum + (d.calories || 0), 0);
    
    return {
      totalSteps,
      totalCalories,
      totalUploads,
      averageSteps: totalUploads > 0 ? Math.round(totalSteps / totalUploads) : 0,
      averageCalories: totalUploads > 0 ? Math.round(totalCalories / totalUploads) : 0
    };
  }

  calculateAverage(values: (number | null)[]): number {
    const validValues = values.filter(v => v !== null) as number[];
    return validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0;
  }

  goToUpload(): void {
    this.router.navigate(['/upload']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  formatValue(value: number | null): string {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  roundValue(value: number): number {
    return Math.round(value);
  }

  convertCaloriesToKcal(calories: number | null): number {
    if (calories === null || calories === undefined) return 0;
    return Math.round(calories / 1000 * 100) / 100; // Round to 2 decimal places
  }

  formatCalories(calories: number | null): string {
    if (calories === null || calories === undefined) return 'N/A';
    return calories.toLocaleString();
  }

  formatKcal(calories: number | null): string {
    if (calories === null || calories === undefined) return 'N/A';
    const kcal = this.convertCaloriesToKcal(calories);
    return kcal.toFixed(2);
  }

}
