import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-screenshot-modal',
  templateUrl: './screenshot-modal.component.html',
  styleUrls: ['./screenshot-modal.component.scss']
})
export class ScreenshotModalComponent {
  @Input() isOpen = false;
  @Input() appType = '';
  @Output() closeModal = new EventEmitter<void>();

  get screenshotPath(): string {
    let extension = 'jpg';
    if (this.appType === 'samsung-health' || this.appType === 'google-fit') {
      extension = 'jpeg';
    }
    return `assets/images/samples/${this.appType}-sample.${extension}`;
  }

  get appName(): string {
    switch (this.appType) {
      case 'apple-health':
        return 'Apple Health';
      case 'fitbit':
        return 'Fitbit';
      case 'samsung-health':
        return 'Samsung Health';
      case 'google-fit':
        return 'Google Fit';
      default:
        return 'Health App';
    }
  }

  get appDescription(): string {
    switch (this.appType) {
      case 'apple-health':
        return 'Steps: 8,234 | Calories: 1,586';
      case 'fitbit':
        return 'Steps: 12,456 | Calories: 2,340';
      case 'samsung-health':
        return 'Steps: 9,876 | Calories: 1,890';
      case 'google-fit':
        return 'Steps: 10,234 | Calories: 2,156';
      default:
        return 'Sample health data';
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
