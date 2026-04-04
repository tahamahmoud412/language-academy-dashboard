import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enrollment } from '../../../../../core/models/enrollment.model';
import { EnrollmentsAdd } from '../enrollments-add/enrollments-add';
import { EnrollmentApiService } from '../../../../../core/services/enrollment-api.service';
import { Pagination } from '../../../../../core/models/service.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enrollments-list',
  standalone: true,
  imports: [CommonModule, EnrollmentsAdd],
  templateUrl: './enrollments-list.html',
  styleUrl: './enrollments-list.css',
})
export class EnrollmentsList implements OnInit {
  private enrollmentApi = inject(EnrollmentApiService);

  loading = signal<boolean>(true);
  enrollments = signal<Enrollment[]>([]);
  pagination = signal<Pagination | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(15);

  ngOnInit() {
    this.fetchEnrollments();
  }

  fetchEnrollments(page: number = 1): void {
    this.loading.set(true);
    this.enrollmentApi.getEnrollments(page, this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.enrollments.set(response.data);
          this.pagination.set(response.pagination || null);
          this.currentPage.set(page);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching enrollments:', err);
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && (!this.pagination() || page <= this.pagination()!.last_page)) {
      this.fetchEnrollments(page);
    }
  }

  isEditVisible = signal(false);
  selectedEnrollment = signal<Enrollment | null>(null);

  onUpdateStatus(enrollment: Enrollment): void {
    Swal.fire({
      title: 'تحديث حالة التسجيل',
      html: `
        <div class="flex flex-col items-center gap-4 py-4 rtl">
          <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
             <i class="pi pi-pencil text-2xl"></i>
          </div>
          <p class="text-slate-500 font-['Cairo'] text-sm text-center">أنت الآن تقوم بتحديث حالة تسجيل الطالب <b>${enrollment.full_name}</b></p>
        </div>
      `,
      input: 'select',
      inputOptions: {
        'pending': '⏳ قيد المراجعة',
        'approved': '✅ مقبول',
        'rejected': '❌ مرفوض',
        'rejected_and_resend': '🔄 مرفوض (إعادة إرسال)',
      },
      inputValue: enrollment.status,
      showCancelButton: true,
      confirmButtonText: 'تحديث الحالة',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#FF6900',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-3xl border-none p-8 shadow-2xl',
        title: 'font-bold text-2xl text-slate-800 font-[\'Cairo\']',
        input: 'rounded-xl border-slate-200 focus:ring-orange-500 font-[\'Cairo\'] text-sm py-2 px-4 shadow-sm h-12',
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
        this.enrollmentApi.updateEnrollment(enrollment.id, { status: result.value }).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم التحديث بنجاح',
              text: 'لقد تم تعديل حالة التسجيل بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900',
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
              confirmButtonColor: '#FF6900',
            });
          }
        });
      }
    });
  }

  totalEnrollments = () => this.pagination()?.total || 0;

  openEdit(enrollment: Enrollment) {

    this.selectedEnrollment.set(enrollment);
    this.isEditVisible.set(true);
  }

  closeEdit() {
    this.isEditVisible.set(false);
  }


  deleteEnrollment(id: number | undefined) {
    if (!id) return;

    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف هذا التسجيل نهائياً!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6900',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enrollmentApi.deleteEnrollment(id).subscribe({
          next: (response) => {
            if (response.success) {
              this.fetchEnrollments(this.currentPage());
              Swal.fire({
                title: 'تم الحذف!',
                text: 'تم حذف التسجيل بنجاح.',
                icon: 'success',
                confirmButtonColor: '#FF6900',
                confirmButtonText: 'حسناً'
              });
            }
          },
          error: (err) => {
            console.error('Error deleting enrollment:', err);
            Swal.fire({
              title: 'خطأ!',
              text: 'حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.',
              icon: 'error',
              confirmButtonColor: '#FF6900',
              confirmButtonText: 'حسناً'
            });
          }
        });
      }
    });
  }

  handleSaved() {
    this.fetchEnrollments(this.currentPage());
    this.closeEdit();
  }
}


