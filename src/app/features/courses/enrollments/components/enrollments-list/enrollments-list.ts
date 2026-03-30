import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enrollment } from '../../../../../core/models/enrollment.model';
import { EnrollmentsAdd } from '../enrollments-add/enrollments-add';
import { EnrollmentApiService } from '../../../../../core/services/enrollment-api.service';
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
  enrollments = signal<Enrollment[]>([]);

  ngOnInit() {
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.enrollmentApi.getEnrollments().subscribe({
      next: (response) => {
        if (response.success) {
          this.enrollments.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading enrollments:', err);
      }
    });
  }


  isEditVisible = signal(false);
  selectedEnrollment = signal<Enrollment | null>(null);

  totalEnrollments = () => this.enrollments().length;

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
              this.loadEnrollments();
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
    this.loadEnrollments();
    this.closeEdit();
  }
}

