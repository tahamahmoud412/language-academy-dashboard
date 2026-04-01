import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-step.html',
  styleUrl: './review-step.css'
})
export class ReviewStepComponent {
  form = input.required<FormGroup>();
  submit = output<void>();

  sectionTypeNames: Record<string, string> = {
    'reading': 'القراءة',
    'listening': 'الاستماع',
    'grammar': 'القواعد'
  };

  get info() {
    return this.form().get('info')!.value;
  }

  get sections() {
    return (this.form().get('sections') as FormArray).controls;
  }

  get totalQuestions(): number {
    return this.sections.reduce((total, section) => {
      return total + (section.get('questions') as FormArray).length;
    }, 0);
  }

  get totalDuration(): number {
    return this.sections.reduce((total, section) => {
      return total + (section.get('time_minutes')?.value || 0);
    }, 0);
  }

  getSectionStats(): { type: string, name: string, count: number, time: number }[] {
    return this.sections.map(section => ({
      type: section.get('section_type')?.value || '',
      name: this.sectionTypeNames[section.get('section_type')?.value] || 'غير محدد',
      count: (section.get('questions') as FormArray).length,
      time: section.get('time_minutes')?.value || 0
    })).filter(s => s.count > 0);
  }

  onSubmit() {
    this.submit.emit();
  }
}
