import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Exam } from '../../../core/models/exams.model';

@Component({
  selector: 'app-bottom-dashboard',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './bottom-dashboard.html',
  styleUrl: './bottom-dashboard.css',
})
export class BottomDashboard {
  upcomingExams = input<Exam[]>([]);
  recentReviews = input<any[]>([]);
}
