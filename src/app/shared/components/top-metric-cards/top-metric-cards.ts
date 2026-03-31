import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-top-metric-cards',
  imports: [NgOptimizedImage],
  templateUrl: './top-metric-cards.html',
  styleUrl: './top-metric-cards.css',
})
export class TopMetricCards {
  stats = input<DashboardStats | null>(null);
}



