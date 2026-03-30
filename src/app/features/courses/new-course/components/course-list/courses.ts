import { Component, OnInit, inject, signal } from '@angular/core';
import { CoursesFilter } from '../../../../../shared/components/courses-filter/courses-filter';
import { CoursesHeader } from '../../../../../shared/components/courses-header/courses-header';
import { CoursesTable } from '../../../../../shared/components/courses-table/courses-table';
import { CourseAdd } from '../course-add/course-add';
import { CourseService } from '../../../../../core/services/course.service';
import { Course, CourseStats } from '../../../../../core/models/courses.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CoursesFilter, CoursesHeader, CoursesTable, CourseAdd],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  private courseService = inject(CourseService);
  
  stats = signal<CourseStats | null>(null);
  coursesList = signal<Course[]>([]);
  loading = signal(true);
  isAddCourseVisible = signal(false);

  openAddCourse(): void {
    this.isAddCourseVisible.set(true);
  }

  closeAddCourse(): void {
    this.isAddCourseVisible.set(false);
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
