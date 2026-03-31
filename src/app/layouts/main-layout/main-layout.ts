import { TopMetricCards } from './../../shared/components/top-metric-cards/top-metric-cards';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
