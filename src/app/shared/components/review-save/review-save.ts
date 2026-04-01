import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-save',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-save.html',
  styleUrl: './review-save.css',
})
export class ReviewSave {
  @Input() form!: FormGroup;

  get courseInfo() {
    return this.form.get('courseInfo')?.value;
  }

  get additionalDetails() {
    return this.form.get('additionalDetails')?.value;
  }

  get topics(): FormArray {
    return this.form.get('courseContent')?.get('topics') as FormArray;
  }

  get lectures(): FormArray {
    return this.form.get('timeTable')?.get('lectures') as FormArray;
  }
}
