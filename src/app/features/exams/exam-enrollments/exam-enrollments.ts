import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamEnrollment, Pagination } from '../../../core/models/exam-enrollment.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exam-enrollments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-enrollments.html',
  styleUrl: './exam-enrollments.css',
})
export class ExamEnrollments implements OnInit {
  private examService = inject(ExamService);
  private route = inject(ActivatedRoute);

  loading = signal<boolean>(true);
  enrollments = signal<ExamEnrollment[]>([]);
  pagination = signal<Pagination | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(15);
  examId = signal<number | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const raw = params.get('examId');
      const parsed = raw ? Number(raw) : NaN;
      this.examId.set(Number.isFinite(parsed) ? parsed : null);
      this.fetchEnrollments(1);
    });
  }

  fetchEnrollments(page: number = 1): void {
    this.loading.set(true);
    this.examService.getExamEnrollments(page, this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.enrollments.set(response.data);
          this.pagination.set(response.pagination ?? null);
          this.currentPage.set(response.pagination?.current_page ?? page);
          if (response.pagination?.per_page) {
            this.pageSize.set(response.pagination.per_page);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching exam enrollments:', err);
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && (!this.pagination() || page <= this.pagination()!.last_page)) {
      this.fetchEnrollments(page);
    }
  }

  viewReceipt(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onUpdateStatus(enrollment: ExamEnrollment): void {
    Swal.fire({
      title: 'تحديث حالة الحجز',
      html: `
        <div class="flex flex-col items-center gap-4 py-4 rtl">
          <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
             </svg>
          </div>
          <p class="text-slate-500 font-['Cairo'] text-sm">أنت الآن تقوم بتحديث حالة حجز الطالب <b>${enrollment.full_name}</b></p>
        </div>
      `,
      input: 'select',
      inputOptions: {
        'pending': '⏳ قيد الانتظار',
        'approved': '✅ تم الموافقة',
        'completed': '✨ مكتمل',
      },
      inputValue: enrollment.status,
      showCancelButton: true,
      confirmButtonText: 'تحديث الحالة',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-3xl border-none p-8 shadow-2xl',
        title: 'font-bold text-2xl text-slate-800 font-[\'Cairo\']',
        input: 'rounded-xl border-slate-200 focus:ring-blue-500 font-[\'Cairo\'] text-sm py-2 px-4 shadow-sm h-12',
        confirmButton: 'rounded-xl px-8 py-3 text-sm font-bold font-[\'Cairo\'] transition-all hover:scale-105 active:scale-95',
        cancelButton: 'rounded-xl px-8 py-3 text-sm font-bold font-[\'Cairo\'] transition-all'
      },
      backdrop: `rgba(15, 23, 42, 0.4) blur(4px)`,
      inputValidator: (value) => {
        if (!value) return 'يرجى اختيار حالة صالحة';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.examService.updateExamEnrollmentStatus(enrollment.id, result.value).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم التحديث بنجاح',
              text: 'لقد تم تعديل حالة حجز هذا الطالب بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#2563eb',
              customClass: {
                popup: 'rounded-3xl',
                title: 'font-bold font-[\'Cairo\']',
                confirmButton: 'rounded-xl font-[\'Cairo\'] px-8'
              }
            });
            this.fetchEnrollments(this.currentPage());
          },
          error: (err) => {
            console.error('Status update error:', err);
            Swal.fire({
              title: 'خطأ في التحديث',
              text: 'لم نتمكن من تحديث الحالة. يرجى المحاولة مرة أخرى.',
              icon: 'error',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#2563eb',
              customClass: {
                popup: 'rounded-3xl',
                title: 'font-bold font-[\'Cairo\']'
              }
            });
          }
        });
      }
    });
  }

  onDeleteEnrollment(id: number): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'هذا الإجراء سيقوم بحذف حجز هذا الطالب بشكل كامل ونهائي.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، قم بالحذف',
      cancelButtonText: 'إلغاء التراجع',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-3xl p-8',
        title: 'font-bold text-2xl text-slate-800 font-[\'Cairo\']',
        confirmButton: 'rounded-xl px-8 py-3 text-sm font-bold font-[\'Cairo\'] transition-all hover:scale-105',
        cancelButton: 'rounded-xl px-8 py-3 text-sm font-bold font-[\'Cairo\']'
      },
      backdrop: `rgba(15, 23, 42, 0.4) blur(4px)`
    }).then((result) => {
      if (result.isConfirmed) {
        this.examService.deleteExamEnrollment(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم الحذف بنجاح',
              text: 'تمت إزالة سجل حجز هذا الطالب من النظام.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#2563eb',
              customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'rounded-xl font-[\'Cairo\'] px-8'
              }
            });
            this.fetchEnrollments(this.currentPage());
          },
          error: (err) => {
            console.error('Delete error:', err);
            Swal.fire({
              title: 'خطأ أثناء الحذف',
              text: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.',
              icon: 'error',
              customClass: {
                popup: 'rounded-3xl'
              }
            });
          }
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'مكتمل';
      case 'approved': return 'تم الموافقة';
      case 'pending': return 'قيد الانتظار';
      default: return status;
    }
  }
}
