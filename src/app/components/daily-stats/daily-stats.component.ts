import { Component, Input } from '@angular/core';
import { HealthData } from '../../models/health-data.model';

@Component({
  selector: 'app-daily-stats',
  templateUrl: './daily-stats.component.html',
  styleUrls: ['./daily-stats.component.scss']
})
export class DailyStatsComponent {
  @Input() healthData: HealthData | null = null;

  formatValue(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  }
}
