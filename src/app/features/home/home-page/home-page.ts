import { Component } from '@angular/core';
import { TopMetricCards } from '../../../shared/components/top-metric-cards/top-metric-cards';
import { MainBanner } from '../../../shared/components/main-banner/main-banner';
import { BottomDashboard } from '../../../shared/components/bottom-dashboard/bottom-dashboard';

@Component({
  selector: 'app-home-page',
  imports: [TopMetricCards, MainBanner, BottomDashboard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
