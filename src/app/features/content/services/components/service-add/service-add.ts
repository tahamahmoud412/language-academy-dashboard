import { Component, Output, EventEmitter, inject, signal, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServicesApiService } from '../../../../../core/services/services-api.service';
import { Service } from '../../../../../core/models/service.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-add.html',
  styleUrls: ['./service-add.css'],
})
export class ServiceAdd implements OnInit {
  private fb = inject(FormBuilder);
  private servicesApi = inject(ServicesApiService);
  
  serviceToEdit = input<Service | null>(null);

  @Output() onClose = new EventEmitter<void>();
  @Output() onServiceAdded = new EventEmitter<void>();

  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  ngOnInit(): void {
    const service = this.serviceToEdit();
    if (service) {
      this.serviceForm.patchValue({
        title: service.title,
        description: service.description
      });
      
      this.imagePreview.set(service.image);
      
      service.features.forEach(f => {
        this.features.push(this.fb.control(f, Validators.required));
      });
    }
  }

  serviceForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    newFeature: [''],
    features: this.fb.array([], Validators.required)
  });

  get features(): FormArray {
    return this.serviceForm.get('features') as FormArray;
  }

  addFeature(): void {
    const value = this.serviceForm.get('newFeature')?.value?.trim();
    if (value) {
      this.features.push(this.fb.control(value, Validators.required));
      this.serviceForm.get('newFeature')?.reset();
    }
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
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

  saveService(): void {
    if (this.serviceForm.valid) {
      this.isLoading.set(true);
      const formData = new FormData();
      const rawValue = this.serviceForm.getRawValue();

      formData.append('title[ar]', rawValue.title);
      formData.append('description[ar]', rawValue.description);
      
      rawValue.features.forEach((feature: string) => {
        formData.append('features[ar][]', feature);
      });

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      const service = this.serviceToEdit();
      const request = service 
        ? this.servicesApi.updateService(service.id, formData)
        : this.servicesApi.createService(formData);

      request.subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success) {
            Swal.fire({
              title: 'تم بنجاح!',
              text: service ? 'تم تحديث الخدمة بنجاح.' : 'تمت إضافة الخدمة بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900'
            });
            this.onServiceAdded.emit();
            this.close();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error in service operation:', err);
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
      this.serviceForm.markAllAsTouched();
    }
  }

  close(): void {
    this.onClose.emit();
  }
}
