import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { CourseStats } from '../../../core/models/courses.model';

@Component({
  selector: 'app-courses-header',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './courses-header.html',
  styleUrl: './courses-header.css',
})
export class CoursesHeader implements OnInit {
  @Input() stats: CourseStats | null = null;
  @Output() onAddCourse = new EventEmitter<void>();

  ngOnInit(): void {
    // Component initialization logic
  }
}
