import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HealthData } from '../models/health-data.model';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private apiUrl = 'http://localhost:8080/api/health';

  constructor(private http: HttpClient) { }


  uploadImage(file: File, date: string): Observable<HealthData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);

    return this.http.post<HealthData>(`${this.apiUrl}/upload`, formData);
  }

  uploadImageWithManualData(steps: number, calories: number, date: string): Observable<HealthData> {
    const formData = new FormData();
    formData.append('steps', steps.toString());
    formData.append('calories', calories.toString());
    formData.append('date', date);

    return this.http.post<HealthData>(`${this.apiUrl}/upload-manual`, formData);
  }

  getHealthData(): Observable<HealthData[]> {
    return this.http.get<HealthData[]>(`${this.apiUrl}/user/current`);
  }

  ping(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/ping`, { responseType: 'text' as 'json' });
  }


  getUploadedDates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/user/uploaded-dates`);
  }

  validateToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-token`, {
      params: { token: token }
    });
  }
}
