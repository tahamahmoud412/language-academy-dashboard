import { Component, input, signal, computed } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-bottom-dashboard',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './bottom-dashboard.html',
  styleUrl: './bottom-dashboard.css',
})
export class BottomDashboard {
  stats = input<DashboardStats | null>(null);

  // Exams Pagination
  examCurrentPage = signal(1);
  itemsPerPage = 3;

  paginatedExams = computed(() => {
    const exams = this.stats()?.upcoming_exams_list || [];
    const start = (this.examCurrentPage() - 1) * this.itemsPerPage;
    return exams.slice(start, start + this.itemsPerPage);
  });

  examTotalPages = computed(() => {
    const len = this.stats()?.upcoming_exams_list?.length || 0;
    return Math.max(1, Math.ceil(len / this.itemsPerPage));
  });

  changeExamPage(page: number) {
    if (page >= 1 && page <= this.examTotalPages()) {
      this.examCurrentPage.set(page);
    }
  }

  // Reviews Pagination
  reviewCurrentPage = signal(1);

  paginatedReviews = computed(() => {
    const reviews = this.stats()?.recent_reviews || [];
    const start = (this.reviewCurrentPage() - 1) * this.itemsPerPage;
    return reviews.slice(start, start + this.itemsPerPage);
  });

  reviewTotalPages = computed(() => {
    const len = this.stats()?.recent_reviews?.length || 0;
    return Math.max(1, Math.ceil(len / this.itemsPerPage));
  });

  changeReviewPage(page: number) {
    if (page >= 1 && page <= this.reviewTotalPages()) {
      this.reviewCurrentPage.set(page);
    }
  }
}
