import { Component, Input } from '@angular/core';
import { TotalStats } from '../../models/health-data.model';

@Component({
  selector: 'app-weekly-progress',
  templateUrl: './weekly-progress.component.html',
  styleUrls: ['./weekly-progress.component.scss']
})
export class WeeklyProgressComponent {
  @Input() totalStats: TotalStats | null = null;

  formatValue(value: number): string {
    return value.toLocaleString();
  }

  roundValue(value: number): number {
    return Math.round(value);
  }
}
