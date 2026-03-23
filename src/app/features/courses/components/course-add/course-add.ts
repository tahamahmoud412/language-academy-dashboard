import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseInfo } from '../../../../shared/components/course-info/course-info';
import { CourseContent } from '../../../../shared/components/course-content/course-content';
import { AdditionalDetails } from '../../../../shared/components/additional-details/additional-details';
import { TimeTable } from '../../../../shared/components/time-table/time-table';
import { ReviewSave } from '../../../../shared/components/review-save/review-save';
import { CourseService } from '../../../../core/services/course.service';
import { CourseRequest } from '../../../../core/models/course.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CourseInfo, CourseContent, AdditionalDetails, TimeTable, ReviewSave],
  templateUrl: './course-add.html',
  styleUrl: './course-add.css',
})
export class CourseAdd {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  @Output() onClose = new EventEmitter<void>();

  currentStep = signal(1);
  totalSteps = 5;

  courseForm: FormGroup = this.fb.group({
    courseInfo: this.fb.group({
      name: ['', Validators.required],
      instructor_name: ['', Validators.required],
      type: ['', Validators.required], // This will now hold the category ID
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      duration: ['', Validators.required]
    }),
    additionalDetails: this.fb.group({
      price: ['', [Validators.required, Validators.min(0)]],
      maxStudents: ['', [Validators.required, Validators.min(1)]],
      lastRegistrationDate: ['', [Validators.required, this.futureDateValidator()]],
      location: ['', Validators.required],
      level: ['', Validators.required],
      language: ['', Validators.required],
      description: ['', Validators.required],
      status: ['draft', Validators.required]
    }),
    courseContent: this.fb.group({
      topics: this.fb.array([])
    }),
    timeTable: this.fb.group({
      lectures: this.fb.array([])
    })
  });

  private futureDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const date = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today ? null : { futureDate: true };
    };
  }

  steps = [
    { id: 1, label: 'معلومات الدورة' },
    { id: 2, label: 'تفاصيل اضافية' },
    { id: 3, label: 'محتوى الدورة' },
    { id: 4, label: 'الجدول الزمني' },
    { id: 5, label: 'مراجعة وحفظ' }
  ];

  getStepForm(step: number): FormGroup {
    switch (step) {
      case 1: return this.courseForm.get('courseInfo') as FormGroup;
      case 2: return this.courseForm.get('additionalDetails') as FormGroup;
      case 3: return this.courseForm.get('courseContent') as FormGroup;
      case 4: return this.courseForm.get('timeTable') as FormGroup;
      default: return this.fb.group({});
    }
  }

  nextStep(): void {
    const currentStepForm = this.getStepForm(this.currentStep());
    if (this.currentStep() < 5 && currentStepForm.invalid) {
      currentStepForm.markAllAsTouched();
      return;
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  saveCourse(): void {
    if (this.courseForm.valid) {
      const rawValue = this.courseForm.getRawValue();
      
      const courseRequest: CourseRequest = {
        name: { ar: rawValue.courseInfo.name, en: rawValue.courseInfo.name },
        instructor_name: { ar: rawValue.courseInfo.instructor_name, en: rawValue.courseInfo.instructor_name },
        description: { ar: rawValue.additionalDetails.description, en: rawValue.additionalDetails.description },
        location: { ar: rawValue.additionalDetails.location, en: rawValue.additionalDetails.location },
        start_date: rawValue.courseInfo.startDate,
        end_date: rawValue.courseInfo.endDate,
        duration_days: this.parseDuration(rawValue.courseInfo.duration),
        price: rawValue.additionalDetails.price,
        max_students: rawValue.additionalDetails.maxStudents,
        registration_deadline: rawValue.additionalDetails.lastRegistrationDate,
        level: this.mapLevel(rawValue.additionalDetails.level),
        language: this.mapLanguage(rawValue.additionalDetails.language),
        status: rawValue.additionalDetails.status,
        course_category_id: Number(rawValue.courseInfo.type),
        topics: rawValue.courseContent.topics.map((t: any, index: number) => ({
          title: { ar: t.title, en: t.title },
          description: { ar: t.description, en: t.description },
          hours: t.hours || 0,
          sort_order: index + 1
        })),
        schedules: rawValue.timeTable.lectures.map((l: any) => ({
          lecture_date: l.date,
          start_time: l.startTime,
          end_time: l.endTime
        }))
      };

      console.log(courseRequest.course_category_id)

      this.courseService.createCourse(courseRequest).subscribe({
        next: (res) => {
          console.log('Course Success:', res);
          Swal.fire({
            title: 'تم بنجاح!',
            text: 'تم حفظ الدورة بنجاح في النظام.',
            icon: 'success',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#0066CC'
          });
          this.close();
        },
        error: (err) => {
          console.error('Course Error:', err);
          Swal.fire({
            title: 'خطأ!',
            text: 'حدث خطأ أثناء حفظ الدورة. يرجى المحاولة مرة أخرى.',
            icon: 'error',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#0066CC'
          });
        }
      });
    } else {
      this.courseForm.markAllAsTouched();
      Swal.fire({
        title: 'تنبيه',
        text: 'يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح.',
        icon: 'warning',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#0066CC'
      });
    }
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    if (!match) return 0;
    const value = parseInt(match[0], 10);
    if (duration.includes('أسبوع') || duration.includes('weeks')) return value * 7;
    if (duration.includes('شهر') || duration.includes('months')) return value * 30;
    return value;
  }

  private mapLevel(level: string): string {
    const levels: Record<string, string> = {
      'مبتدئ': 'beginner',
      'متوسط': 'intermediate',
      'متقدم': 'advanced',
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    };
    return levels[level] || 'beginner';
  }

  private mapLanguage(lang: string): string {
    const langs: Record<string, string> = {
      'العربية': 'ar',
      'الإنجليزية': 'en',
      'ar': 'ar',
      'en': 'en'
    };
    return langs[lang] || 'ar';
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  close(): void {
    this.onClose.emit();
  }
}
