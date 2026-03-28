import { Component } from '@angular/core';
import { MainBanner } from '../../../shared/components/main-banner/main-banner';
import { BottomDashboard } from '../../../shared/components/bottom-dashboard/bottom-dashboard';

@Component({
  selector: 'app-home-page',
  imports: [MainBanner, BottomDashboard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
