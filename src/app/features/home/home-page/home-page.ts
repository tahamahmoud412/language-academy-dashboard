import { Component, OnInit, inject, signal } from '@angular/core';
import { MainBanner } from '../../../shared/components/main-banner/main-banner';
import { BottomDashboard } from '../../../shared/components/bottom-dashboard/bottom-dashboard';
import { TopMetricCards } from '../../../shared/components/top-metric-cards/top-metric-cards';
import { DashboardApiService } from '../../../core/services/dashboard-api.service';
import { DashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MainBanner, BottomDashboard, TopMetricCards],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private dashboardApi = inject(DashboardApiService);

  stats = signal<DashboardStats | null>(null);

  ngOnInit() {
    this.dashboardApi.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load dashboard stats', err)
    });
  }
}

