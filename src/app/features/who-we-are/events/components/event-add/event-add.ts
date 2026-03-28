import { Component, Output, EventEmitter, inject, signal, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TimelineEvent } from '../../../../../core/models/event.model';
import { EventApiService } from '../../../../../core/services/event-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-add.html',
  styleUrl: './event-add.css',
})
export class EventAdd implements OnInit {
  private fb = inject(FormBuilder);
  private eventApi = inject(EventApiService);
  
  eventToEdit = input<TimelineEvent | null>(null);

  @Output() onClose = new EventEmitter<void>();
  @Output() onEventSaved = new EventEmitter<void>();

  isLoading = signal(false);

  eventForm: FormGroup = this.fb.group({
    year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
    "title[ar]": ['', [Validators.required, Validators.minLength(3)]],
    "description[ar]": ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    const event = this.eventToEdit();
    if (event) {
      this.eventForm.patchValue({
        year: event.year,
        "title[ar]": event.title,
        "description[ar]": event.description
      });
    }
  }

  saveEvent(): void {
    if (this.eventForm.valid) {
      this.isLoading.set(true);
      const formData = new FormData();
      const rawValue = this.eventForm.value;
      
      formData.append('year', rawValue.year);
      formData.append('title[ar]', rawValue['title[ar]']);
      formData.append('description[ar]', rawValue['description[ar]']);

      const editingEvent = this.eventToEdit();
      const request = editingEvent?.id 
        ? this.eventApi.updateEvent(editingEvent.id, formData)
        : this.eventApi.createEvent(formData);

      request.subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            Swal.fire({
              title: 'تم بنجاح!',
              text: editingEvent ? 'تم تحديث الحدث بنجاح.' : 'تمت إضافة الحدث بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900'
            });
            this.onEventSaved.emit();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error saving event:', err);
          Swal.fire({
            title: 'خطأ!',
            text: 'حدث خطأ أثناء تنفيذ العملية. يرجى المحاولة مرة أخرى.',
            icon: 'error',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#FF6900'
          });
        }
      });
    } else {
      this.eventForm.markAllAsTouched();
    }
  }


  close(): void {
    this.onClose.emit();
  }
}
