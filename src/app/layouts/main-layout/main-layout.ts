import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SideBar } from '../../shared/components/side-bar/side-bar';
import { TopMetricCards } from './../../shared/components/top-metric-cards/top-metric-cards';
import { DashboardService } from '../../core/services/dashboard.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideBar, TopMetricCards],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  stats = this.dashboardService.stats;
  isSidebarOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.dashboardService.fetchStats().subscribe();

    // Close sidebar on navigation (mobile)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeSidebar();
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
