import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FAQ } from '../../../../../core/models/faq.model';
import { FaqAdd } from '../faq-add/faq-add';
import { FaqApiService } from '../../../../../core/services/faq-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, FaqAdd],
  templateUrl: './faq-list.html',
  styleUrl: './faq-list.css',
})
export class FaqList implements OnInit {
  private faqApi = inject(FaqApiService);
  faqs = signal<FAQ[]>([]);

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.faqApi.getFaqs().subscribe({
      next: (response) => {
        if (response.success) {
          this.faqs.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading FAQs:', err);
      }
    });
  }


  isAddFaqVisible = signal(false);
  selectedFaq = signal<FAQ | null>(null);

  totalFaqs = () => this.faqs().length;

  openAddFaq() {
    this.selectedFaq.set(null);
    this.isAddFaqVisible.set(true);
  }

  openEditFaq(faq: FAQ) {
    this.selectedFaq.set(faq);
    this.isAddFaqVisible.set(true);
  }

  closeAddFaq() {
    this.isAddFaqVisible.set(false);
  }

  deleteFaq(id: number) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة هذا السؤال بعد الحذف!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6900',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، احذفه!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.faqApi.deleteFaq(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم الحذف!',
              text: 'تم حذف السؤال بنجاح.',
              icon: 'success',
              confirmButtonColor: '#FF6900',
              confirmButtonText: 'حسناً'
            });
            this.loadFaqs();
          },
          error: (err) => {
            console.error('Error deleting FAQ:', err);
            Swal.fire({
              title: 'خطأ!',
              text: 'حدث خطأ أثناء محاولة الحذف.',
              icon: 'error',
              confirmButtonColor: '#FF6900',
              confirmButtonText: 'حسناً'
            });
          }
        });
      }
    });
  }

  handleFaqSaved() {
    this.loadFaqs();
    this.closeAddFaq();
  }

}
