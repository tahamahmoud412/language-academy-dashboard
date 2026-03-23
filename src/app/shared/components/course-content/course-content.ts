import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-content.html',
  styleUrl: './course-content.css',
})
export class CourseContent implements OnInit {
  private fb = inject(FormBuilder);
  @Input() form!: FormGroup;

  addTopicForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    hours: [null, [Validators.min(1)]]
  });

  get topics(): FormArray {
    return this.form.get('topics') as FormArray;
  }

  ngOnInit(): void {
  }

  addTopic(): void {
    if (this.addTopicForm.valid) {
      this.topics.push(this.fb.group({
        title: [this.addTopicForm.value.title, Validators.required],
        description: [this.addTopicForm.value.description, Validators.required],
        hours: [this.addTopicForm.value.hours]
      }));
      this.addTopicForm.reset();
    } else {
      this.addTopicForm.markAllAsTouched();
    }
  }

  removeTopic(index: number): void {
    this.topics.removeAt(index);
  }
}
