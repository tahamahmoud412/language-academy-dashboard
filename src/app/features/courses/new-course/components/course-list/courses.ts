import { Component, OnInit, inject, signal } from '@angular/core';
import { CoursesFilter } from '../../../../../shared/components/courses-filter/courses-filter';
import { CoursesHeader } from '../../../../../shared/components/courses-header/courses-header';
import { CoursesTable } from '../../../../../shared/components/courses-table/courses-table';
import { CourseAdd } from '../course-add/course-add';
import { CourseService } from '../../../../../core/services/course.service';
import { Course, CourseStats } from '../../../../../core/models/courses.model';
import { TopMetricCards } from '../../../../../shared/components/top-metric-cards/top-metric-cards';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CoursesFilter, CoursesHeader, CoursesTable, CourseAdd, TopMetricCards],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  private courseService = inject(CourseService);
  
  stats = signal<CourseStats | null>(null);
  coursesList = signal<Course[]>([]);
  loading = signal(true);
  isAddCourseVisible = signal(false);
  editingCourseId = signal<number | null>(null);

  openAddCourse(): void {
    this.editingCourseId.set(null);
    this.isAddCourseVisible.set(true);
  }

  onEditCourse(id: number): void {
    this.editingCourseId.set(id);
    this.isAddCourseVisible.set(true);
  }

  onDeleteCourse(id: number): void {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'هل أنت متأكد؟',
        text: 'لن تتمكن من استرجاع هذا الكورس!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء',
      }).then((result) => {
        if (result.isConfirmed) {
          this.courseService.destroyCourse(id).subscribe({
            next: () => {
              Swal.default.fire('تم الحذف!', 'تم حذف الكورس بنجاح.', 'success');
              this.fetchCourses();
            },
            error: (err) => {
              console.error('Delete error', err);
              Swal.default.fire('خطأ!', 'حدث خطأ أثناء محاولة الحذف.', 'error');
            },
          });
        }
      });
    });
  }

  private isActiveStatus(status: string | null | undefined): boolean {
    const normalized = (status ?? '').toLowerCase();
    return normalized === 'published' || normalized === 'نشط';
  }

  onToggleCourseActive(course: Course): void {
    const willActivate = !this.isActiveStatus(course.status);
    const nextStatus = willActivate ? 'published' : 'draft';

    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: willActivate ? 'تفعيل الكورس' : 'إلغاء تفعيل الكورس',
        text: willActivate ? 'هل تريد تفعيل هذا الكورس؟' : 'هل تريد إلغاء تفعيل هذا الكورس؟',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'تأكيد',
        cancelButtonText: 'إلغاء',
      }).then((result) => {
        if (!result.isConfirmed) return;

        this.courseService.updateCourse(course.id, { status: nextStatus }).subscribe({
          next: () => {
            Swal.default.fire('تم!', willActivate ? 'تم تفعيل الكورس.' : 'تم إلغاء تفعيل الكورس.', 'success');
            this.fetchCourses();
          },
          error: (err) => {
            console.error('Status update error', err);
            Swal.default.fire('خطأ!', 'حدث خطأ أثناء تحديث حالة الكورس.', 'error');
          },
        });
      });
    });
  }

  closeAddCourse(): void {
    this.isAddCourseVisible.set(false);
    this.editingCourseId.set(null);
  }

  handleCourseAddClose(): void {
    this.closeAddCourse();
    this.fetchCourses();
  }

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.loading.set(true);
    this.courseService.getCourses().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data.stats);
          this.coursesList.set(response.data.courses);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
