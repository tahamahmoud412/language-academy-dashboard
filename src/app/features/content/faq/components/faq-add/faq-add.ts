import { Component, Output, EventEmitter, inject, signal, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FAQ } from '../../../../../core/models/faq.model';
import { FaqApiService } from '../../../../../core/services/faq-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faq-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq-add.html',
  styleUrl: './faq-add.css',
})
export class FaqAdd implements OnInit {
  private fb = inject(FormBuilder);
  private faqApi = inject(FaqApiService);
  
  faqToEdit = input<FAQ | null>(null);

  @Output() onClose = new EventEmitter<void>();
  @Output() onFaqSaved = new EventEmitter<void>();

  isLoading = signal(false);

  faqForm: FormGroup = this.fb.group({
    "question[ar]": ['', [Validators.required, Validators.minLength(5)]],
    "answer[ar]": ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    const faq = this.faqToEdit();
    if (faq) {
      this.faqForm.patchValue({
        "question[ar]": faq.question,
        "answer[ar]": faq.answer
      });
    }
  }

  saveFaq(): void {
    if (this.faqForm.valid) {
      this.isLoading.set(true);
      const formData = new FormData();
      formData.append('question[ar]', this.faqForm.get('question[ar]')?.value);
      formData.append('answer[ar]', this.faqForm.get('answer[ar]')?.value);
      
      const editingFaq = this.faqToEdit();

      const request = editingFaq?.id 
        ? this.faqApi.updateFaq(editingFaq.id, formData)
        : this.faqApi.createFaq(formData);

      request.subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            Swal.fire({
              title: 'تم بنجاح!',
              text: editingFaq ? 'تم تحديث السؤال بنجاح.' : 'تمت إضافة السؤال بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900'
            });
            this.onFaqSaved.emit();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error saving FAQ:', err);
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
      this.faqForm.markAllAsTouched();
    }
  }



  close(): void {
    this.onClose.emit();
  }
}
