import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamsHeader } from '../../../shared/components/exams-header/exams-header';
import { ExamsFilter } from '../../../shared/components/exams-filter/exams-filter';
import { ExamsTable } from '../../../shared/components/exams-table/exams-table';
import { Exam, ExamStats, ExamPagination } from '../../../core/models/exams.model';
import { ExamService } from '../../../core/services/exam.service';
import { ExamCreateComponent } from '../exam-create/exam-create.component';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, ExamsHeader, ExamsFilter, ExamsTable, ExamCreateComponent],
  templateUrl: './exams-list.html',
  styleUrl: './exams-list.css',
})
export class ExamsList implements OnInit {
  private examService = inject(ExamService);
  public router = inject(Router);

  loading = signal<boolean>(true);
  isAddExamVisible = signal<boolean>(false);
  editingExamId = signal<number | null>(null);

  stats = signal<ExamStats | null>(null);
  examsList = signal<Exam[]>([]);
  pagination = signal<ExamPagination | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  ngOnInit(): void {
    this.fetchExams();
  }

  fetchExams(page: number = 1): void {
    this.loading.set(true);
    this.examService.getExams(page, this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data.stats);
          console.log(response.data.stats);
          this.examsList.set(response.data.exams);
          this.pagination.set(response.data.pagination);
          this.currentPage.set(response.data.pagination.current_page);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching exams:', err);
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && (!this.pagination() || page <= this.pagination()!.last_page)) {
      this.fetchExams(page);
    }
  }

  openAddExam(): void {
    this.editingExamId.set(null);
    this.isAddExamVisible.set(true);
  }

  onEditExam(id: number): void {
    this.editingExamId.set(id);
    this.isAddExamVisible.set(true);
  }

  onDeleteExam(id: number): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'هل أنت متأكد؟',
        text: 'لن تتمكن من استرجاع هذا الاختبار!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
      }).then((result) => {
        if (result.isConfirmed) {
          this.examService.deleteExam(id).subscribe({
            next: () => {
              Swal.default.fire('تم الحذف!', 'تم حذف الاختبار بنجاح.', 'success');
              this.fetchExams(this.currentPage());
            },
            error: (err) => {
              console.error('Delete error', err);
              Swal.default.fire('خطأ!', 'حدث خطأ أثناء محاولة الحذف.', 'error');
            }
          });
        }
      });
    });
  }

  onViewEnrollments(examId: number): void {
    this.router.navigate(['/exams/enrollments'], {
      queryParams: { examId },
    });
  }

  closeAddExam(): void {
    this.isAddExamVisible.set(false);
    this.editingExamId.set(null);
  }

  handleAddExamClose(success: boolean): void {
    this.closeAddExam();
    if (success) {
      this.fetchExams(this.currentPage());
    }
  }
}
