import { Component, inject } from '@angular/core';
import { BottomDashboard } from '../../../shared/components/bottom-dashboard/bottom-dashboard';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TopMetricCards } from '../../../shared/components/top-metric-cards/top-metric-cards';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [BottomDashboard, TopMetricCards],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private dashboardService = inject(DashboardService);
  stats = this.dashboardService.stats;
}
