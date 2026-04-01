import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Course } from '../../../core/models/courses.model';

@Component({
  selector: 'app-courses-table',
  imports: [NgOptimizedImage],
  templateUrl: './courses-table.html',
  styleUrl: './courses-table.css',
})
export class CoursesTable {
  @Input() courses: Course[] = [];
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  getProgressWidth(course: Course): string {
    if (course.max_students === 0) return '0%';
    const percentage = (course.enrolled_students / course.max_students) * 100;
    return `${percentage}%`;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'published':
      case 'نشط':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
      case 'قادم':
        return 'bg-blue-100 text-blue-600';
      case 'draft':
      case 'مسودة':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'published': return 'نشط';
      case 'upcoming': return 'قادم';
      case 'draft': return 'مسودة';
      default: return status;
    }
  }

  onEdit(id: number): void {
    this.edit.emit(id);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }
}

