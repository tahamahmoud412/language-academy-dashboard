import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-top-metric-cards',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './top-metric-cards.html',
  styleUrl: './top-metric-cards.css',
})
export class TopMetricCards {
  totalStudents = input<number>(0);
  activeCourses = input<number>(0);
  upcomingExams = input<number>(0);
  newServices = input<number>(0);
}
