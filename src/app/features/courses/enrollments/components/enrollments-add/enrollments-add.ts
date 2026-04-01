import { Component, Output, EventEmitter, inject, signal, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Enrollment } from '../../../../../core/models/enrollment.model';
import { EnrollmentApiService } from '../../../../../core/services/enrollment-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enrollments-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enrollments-add.html',
  styleUrl: './enrollments-add.css',
})
export class EnrollmentsAdd implements OnInit {
  private fb = inject(FormBuilder);
  private enrollmentApi = inject(EnrollmentApiService);
  
  enrollmentToEdit = input<Enrollment | null>(null);

  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  enrollmentForm: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(3)]],
    university_name: ['', Validators.required],
    faculty_name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+]{10,15}$/)]],
    degree: ['', Validators.required],
    payment_date: ['', Validators.required],
    nationality: ['egyptian', Validators.required],
    national_id: [''],
    passport_number: [''],
    fawry_receipt: [''],
    bank_receipt: [''],
    status: ['pending', Validators.required]
  });

  ngOnInit(): void {
    const enrollment = this.enrollmentToEdit();
    if (enrollment) {
      // Normalize nationality if needed (handling potential localization from API)
      let nationality = enrollment.nationality;
      if (nationality === 'مصري') nationality = 'egyptian';
      if (nationality === 'وافد' || nationality === 'أجنبي') nationality = 'expatriate';

      this.enrollmentForm.patchValue({
        full_name: enrollment.full_name,
        university_name: enrollment.university_name,
        faculty_name: enrollment.faculty_name,
        phone: enrollment.phone,
        degree: enrollment.degree,
        payment_date: enrollment.payment_date,
        nationality: nationality,
        national_id: enrollment.national_id,
        passport_number: enrollment.passport_number,
        fawry_receipt: enrollment.fawry_receipt,
        bank_receipt: enrollment.bank_receipt,
        status: enrollment.status
      });
      this.imagePreview.set(enrollment.receipt_url);
    }


    // Dynamic validation based on nationality
    this.enrollmentForm.get('nationality')?.valueChanges.subscribe(val => {
      this.updateNationalityValidators(val);
    });
    this.updateNationalityValidators(this.enrollmentForm.get('nationality')?.value);
  }

  private updateNationalityValidators(nationality: string): void {
    const nationalId = this.enrollmentForm.get('national_id');
    const fawry = this.enrollmentForm.get('fawry_receipt');
    const passport = this.enrollmentForm.get('passport_number');
    const bank = this.enrollmentForm.get('bank_receipt');

    if (nationality === 'egyptian') {
      nationalId?.setValidators([Validators.required]);
      fawry?.setValidators([Validators.required]);
      passport?.clearValidators();
      bank?.clearValidators();
    } else {
      nationalId?.clearValidators();
      fawry?.clearValidators();
      passport?.setValidators([Validators.required]);
      bank?.setValidators([Validators.required]);
    }

    nationalId?.updateValueAndValidity();
    fawry?.updateValueAndValidity();
    passport?.updateValueAndValidity();
    bank?.updateValueAndValidity();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.enrollmentForm.valid) {
      this.isLoading.set(true);
      const formData = new FormData();
      const rawValue = this.enrollmentForm.value;

      formData.append('full_name', rawValue.full_name);
      formData.append('university_name', rawValue.university_name);
      formData.append('faculty_name', rawValue.faculty_name);
      formData.append('phone', rawValue.phone);
      formData.append('degree', rawValue.degree);
      formData.append('payment_date', rawValue.payment_date);
      formData.append('nationality', rawValue.nationality);
      formData.append('status', rawValue.status);

      if (rawValue.nationality === 'egyptian') {
        formData.append('national_id', rawValue.national_id);
        formData.append('fawry_receipt_number', rawValue.fawry_receipt);
      } else {
        formData.append('passport_number', rawValue.passport_number);
        formData.append('bank_receipt_number', rawValue.bank_receipt);
      }

      if (this.selectedFile) {
        formData.append('receipt', this.selectedFile);
      }

      const editingId = this.enrollmentToEdit()?.id;
      if (editingId) {
        this.enrollmentApi.updateEnrollment(editingId, formData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            if (response.success) {
              Swal.fire({
                title: 'تم بنجاح!',
                text: 'تم تحديث البيانات بنجاح.',
                icon: 'success',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#FF6900'
              });
              this.onSaved.emit();
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Error updating enrollment:', err);
            Swal.fire({
              title: 'خطأ!',
              text: 'حدث خطأ أثناء التحديث. يرجى المحاولة مرة أخرى.',
              icon: 'error',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900'
            });
          }
        });
      }
    } else {
      this.enrollmentForm.markAllAsTouched();
    }
  }


  close(): void {
    this.onClose.emit();
  }
}
