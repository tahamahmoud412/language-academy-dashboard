import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-time-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './time-table.html',
  styleUrl: './time-table.css',
})
export class TimeTable implements OnInit {
  private fb = inject(FormBuilder);
  @Input() form!: FormGroup;

  addLectureForm: FormGroup = this.fb.group({
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  }, { validators: this.timeRangeValidator() });

  get lectures(): FormArray {
    return this.form.get('lectures') as FormArray;
  }

  ngOnInit(): void {
  }

  timeRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get('startTime')?.value;
      const end = control.get('endTime')?.value;

      if (start && end && start >= end) {
        return { timeRangeInvalid: true };
      }
      return null;
    };
  }

  addLecture(): void {
    if (this.addLectureForm.valid) {
      this.lectures.push(this.fb.group({
        date: [this.addLectureForm.value.date, Validators.required],
        startTime: [this.addLectureForm.value.startTime, Validators.required],
        endTime: [this.addLectureForm.value.endTime, Validators.required]
      }));
      this.addLectureForm.reset({ date: '', startTime: '', endTime: '' });
    } else {
      this.addLectureForm.markAllAsTouched();
    }
  }

  removeLecture(index: number): void {
    this.lectures.removeAt(index);
  }
}
