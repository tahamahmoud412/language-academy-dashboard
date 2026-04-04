import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() viewEnrollments = new EventEmitter<number>();

  onViewEnrollments(exam: Exam): void {
    const enrolled = exam.enrolled_students ?? 0;
    if (enrolled <= 0) {
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          title: 'لا يوجد مسجلين',
          text: 'لا يوجد أشخاص مسجلين في هذا الاختبار حالياً.',
          icon: 'info',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#155DFC',
        });
      });
      return;
    }

    this.viewEnrollments.emit(exam.id);
  }

  getResolvedStatus(exam: Exam): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examDate = new Date(exam.exam_date);
    examDate.setHours(0, 0, 0, 0);

    const status = exam.status?.toLowerCase();

    // 1. If backend says completed → always show completed
    if (status === 'completed') {
      return 'completed';
    }

    // 2. Future date → upcoming
    if (examDate > today) {
      return 'upcoming';
    }

    // 3. Today → ongoing (unless backend says finished)
    if (examDate.getTime() === today.getTime()) {
      return status === 'finished' ? 'finished' : 'ongoing';
    }

    // 4. Past date → finished
    return 'finished';
  }

  getStatusClass(exam: Exam): string {
    switch (this.getResolvedStatus(exam)) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-600';
      case 'ongoing':
        return 'bg-green-50 text-green-600';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600';
      case 'finished':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  }

  getStatusText(exam: Exam): string {
    switch (this.getResolvedStatus(exam)) {
      case 'upcoming':
        return 'قادم';
      case 'ongoing':
        return 'جاري';
      case 'completed':
        return 'مكتمل';
      case 'finished':
        return 'منتهي';
      default:
        return exam.status;
    }
  }

  getProgressWidth(exam: Exam): string {
    const enrolled = exam.enrolled_students || 0;
    const max = exam.max_students || 1;
    return `${(enrolled / max) * 100}%`;
  }
}

