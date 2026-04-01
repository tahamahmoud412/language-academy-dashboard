import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ExamType } from '../../../../../core/models/exams.model';

@Component({
  selector: 'app-exam-info-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-info-step.html',
  styleUrl: './exam-info-step.css'
})
export class ExamInfoStepComponent {
  form = input.required<FormGroup>();
  @Input() examTypes: ExamType[] = [];

  isInvalid(controlName: string): boolean {
    const control = this.form().get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
