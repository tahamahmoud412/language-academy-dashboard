import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../models/dashboard.model';
import { ApiResponse } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/dashboard-stats`;

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(this.apiUrl);
  }
}
