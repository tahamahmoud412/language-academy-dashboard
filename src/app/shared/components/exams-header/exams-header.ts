import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ExamStats } from '../../../core/models/exams.model';

@Component({
  selector: 'app-exams-header',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './exams-header.html',
  styleUrl: './exams-header.css',
})
export class ExamsHeader {
  @Input() stats: ExamStats | null = null;
  @Input() totalExams: number = 0;
  @Output() onAddExam = new EventEmitter<void>();
}
