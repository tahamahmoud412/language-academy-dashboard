import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamsHeader } from '../../../shared/components/exams-header/exams-header';
import { ExamsFilter } from '../../../shared/components/exams-filter/exams-filter';
import { ExamsTable } from '../../../shared/components/exams-table/exams-table';
import { Exam, ExamStats, ExamPagination } from '../../../core/models/exams.model';
import { ExamService } from '../../../core/services/exam.service';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, ExamsHeader, ExamsFilter, ExamsTable],
  templateUrl: './exams-list.html',
  styleUrl: './exams-list.css',
})
export class ExamsList implements OnInit {
  private examService = inject(ExamService);

  loading = signal<boolean>(true);
  isAddExamVisible = signal<boolean>(false);

  stats = signal<ExamStats | null>(null);
  examsList = signal<Exam[]>([]);
  pagination = signal<ExamPagination | null>(null);
  currentPage = signal<number>(1);

  ngOnInit(): void {
    this.fetchExams();
  }

  fetchExams(page: number = 1): void {
    this.loading.set(true);
    this.examService.getExams(page).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data.stats);
          this.examsList.set(response.data.exams);
          this.pagination.set(response.data.pagination);
          this.currentPage.set(response.data.pagination.current_page);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching exams:', err);
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && (!this.pagination() || page <= this.pagination()!.last_page)) {
      this.fetchExams(page);
    }
  }

  openAddExam(): void {
    this.isAddExamVisible.set(true);
  }

  closeAddExam(): void {
    this.isAddExamVisible.set(false);
  }
}
