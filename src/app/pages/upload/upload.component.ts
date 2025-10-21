import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HealthService } from '../../services/health.service';
import { AuthService } from '../../services/auth.service';
import { HealthData } from '../../models/health-data.model';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  errorMessage: string = '';
  
  selectedDate: string = '';
  uploadedDates: string[] = [];
  isLoadingDates = false;
  maxDate: string = '';
  
  showManualEntry = false;
  manualSteps: number = 0;
  manualCalories: number = 0;
  ocrResult: HealthData | null = null;
  
  
  successMessage: string = '';
  showSuccessMessage = false;

  @ViewChild('manualEntryForm', { static: false }) manualEntryForm!: ElementRef;

  constructor(
    private healthService: HealthService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0]; // Set max date to today
    this.selectedDate = this.maxDate; // Set to today
    
    // Only proceed if user is already authenticated
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        this.loadUploadedDates();
      } else {
        // If not authenticated, try to ensure valid session
        this.authService.ensureValidSession();
      }
    });
  }


  loadUploadedDates(): void {
    this.isLoadingDates = true;
    this.healthService.getUploadedDates().subscribe({
      next: (dates) => {
        this.uploadedDates = dates;
        this.isLoadingDates = false;
      },
      error: (error) => {
        console.error('Error loading uploaded dates:', error);
        this.isLoadingDates = false;
      }
    });
  }

  isDateAlreadyUploaded(date: string): boolean {
    return this.uploadedDates.includes(date);
  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
     
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.errorMessage = `File size (${fileSizeMB}MB) exceeds the 2MB limit. Please choose a smaller image.`;
        this.selectedFile = null;
        this.previewUrl = null;
        
        // Clear the file input
        event.target.value = '';
        return;
      }
      
      this.selectedFile = file;
      this.errorMessage = '';
      
   
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      
      this.authService.isAuthenticated().subscribe(isAuth => {
        if (!isAuth) {
          this.errorMessage = 'No valid authentication token found. Please ensure you are properly authenticated.';
          return;
        }
        
        // Continue with file upload logic here
        this.isUploading = true;
        this.errorMessage = '';

        this.healthService.uploadImage(this.selectedFile!, this.selectedDate).subscribe({
        next: (response: any) => {
          this.isUploading = false;
          
          // Check if backend requires manual entry
          if (response.requiresManualEntry) {
            this.ocrResult = response.data;
            this.showManualEntry = true;
            this.manualSteps = response.data.steps || 0;
            this.manualCalories = response.data.calories || 0;
            
            // Auto-scroll to manual form after it appears
            this.scrollToManualForm();
          } else {
            // OCR succeeded - data was saved to database
            this.ocrResult = response;
            
            // Refresh uploaded dates after successful upload
            this.loadUploadedDates();
            
            // Show success message
            const steps = response.steps ? Math.round(response.steps).toLocaleString() : '0';
            const calories = response.calories ? Math.round(response.calories).toLocaleString() : '0';
            this.showSuccessMsg(`Your Data extracted successfully! Steps: ${steps}, Calories: ${calories}`);
            
            setTimeout(() => {
              this.router.navigate(['/dashboard'], { 
                state: { 
                  data: response,
                  isNewUpload: true 
                } 
              });
            }, 2000);
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.isUploading = false;
          
          if (error.status === 409) {
            this.errorMessage = error.error.message || 'This image has already been uploaded';
          } else if (error.status === 401) {
            this.errorMessage = 'Authentication failed. Please check your login status.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
          } else {
            this.errorMessage = error.error?.message || 'Failed to upload image. Please try again.';
          }
        }
      });
      });
    }
  }

  isOcrDataEmpty(data: HealthData): boolean {
    // Only check if calories are missing - steps can be null/0
    return (!data.calories || data.calories === 0);
  }

  onManualSubmit(): void {
    // Only require calories, steps can be 0
    if (this.manualCalories > 0) {
      this.isUploading = true;
      this.errorMessage = '';

      this.healthService.uploadImageWithManualData(this.manualSteps, this.manualCalories, this.selectedDate).subscribe({
        next: (data: HealthData) => {
          this.isUploading = false;
          
          // Refresh uploaded dates after successful upload
          this.loadUploadedDates();
          
          const steps = data.steps ? Math.round(data.steps).toLocaleString() : '0';
          const calories = data.calories ? Math.round(data.calories).toLocaleString() : '0';
          this.showSuccessMsg(`✅ Manual data saved successfully! Steps: ${steps}, Calories: ${calories}`);
          
          setTimeout(() => {
            this.router.navigate(['/dashboard'], { 
              state: { 
                data: data,
                isNewUpload: true 
              } 
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Manual upload error:', error);
          this.isUploading = false;
          
          if (error.status === 400) {
            this.errorMessage = error.error.message || 'No recent upload found. Please upload an image first.';
          } else if (error.status === 401) {
            this.errorMessage = 'Authentication failed. Please check your login status.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
          } else {
            this.errorMessage = error.error?.message || 'Failed to save manual data. Please try again.';
          }
        }
      });
    } else {
      this.errorMessage = 'Please enter valid calories value. Steps are optional.';
    }
  }

  onRetryOcr(): void {
    this.showManualEntry = false;
    this.manualSteps = 0;
    this.manualCalories = 0;
    this.ocrResult = null;
    this.errorMessage = '';
    this.showSuccessMessage = false;
  }

  showSuccessMsg(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    this.errorMessage = '';
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  hideSuccessMsg(): void {
    this.showSuccessMessage = false;
  }


  formatFileSize(bytes: number | null | undefined): string {
    if (!bytes) return '';
    
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Auto-scroll to manual form when it appears
  private scrollToManualForm(): void {
    // Use setTimeout to ensure the DOM has updated
    setTimeout(() => {
      if (this.manualEntryForm) {
        this.manualEntryForm.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        // Optional: Add a subtle highlight effect
        this.highlightManualForm();
      }
    }, 100); // Small delay to ensure form is rendered
  }

  // Optional: Add highlight effect
  private highlightManualForm(): void {
    if (this.manualEntryForm) {
      const element = this.manualEntryForm.nativeElement;
      
      // Add highlight class
      element.classList.add('highlight-manual-form');
      
      // Remove highlight after animation
      setTimeout(() => {
        element.classList.remove('highlight-manual-form');
      }, 2000);
    }
  }
}
