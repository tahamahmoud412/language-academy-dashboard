import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-info.html',
  styleUrl: './course-info.css',
})
export class CourseInfo implements OnInit {
  @Input() form!: FormGroup;
  private courseService = inject(CourseService);
  categories = signal<any[]>([]);

  ngOnInit(): void {
    if (this.form) {
      this.form.addValidators(this.dateRangeValidator());
    }
    this.loadCategories();
  }

  loadCategories(): void {
    this.courseService.getCourseCategories().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.categories.set(res.data);
        }
      },
      error: (err: any) => console.error('Error fetching categories:', err)
    });
  }

  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return { dateRangeInvalid: true };
      }
      return null;
    };
  }
}
