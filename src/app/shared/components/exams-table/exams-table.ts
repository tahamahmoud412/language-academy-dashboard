import { Component, Input } from '@angular/core';
import { NgOptimizedImage, DecimalPipe } from '@angular/common';
import { Exam } from '../../../core/models/exams.model';

@Component({
  selector: 'app-exams-table',
  standalone: true,
  imports: [NgOptimizedImage, DecimalPipe],
  templateUrl: './exams-table.html',
  styleUrl: './exams-table.css',
})
export class ExamsTable {
  @Input() exams: Exam[] = [];

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-600';
      case 'ongoing':
        return 'bg-green-50 text-green-600';
      case 'finished':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'قادم';
      case 'ongoing':
        return 'جاري';
      case 'finished':
        return 'مكتمل';
      default:
        return status;
    }
  }

  getProgressWidth(exam: Exam): string {
    const enrolled = exam.enrolled_students || 0;
    const max = exam.max_students || 1;
    return `${(enrolled / max) * 100}%`;
  }
}
