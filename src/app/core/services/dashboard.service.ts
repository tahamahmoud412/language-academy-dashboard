import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStatsResponse, DashboardStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}admin/dashboard-stats`;

  // Shared state for dashboard stats
  stats = signal<DashboardStats | null>(null);

  fetchStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(this.apiUrl).pipe(
      tap(response => {
        if (response.success) {
          this.stats.set(response.data);
        }
      })
    );
  }
}
