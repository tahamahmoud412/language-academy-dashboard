import { Component, Output, EventEmitter, inject, signal, input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AboutUs } from '../../../../../core/models/about-us.model';
import { AboutUsApiService } from '../../../../../core/services/about-us-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-about-us-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],

  templateUrl: './about-us-add.html',
  styleUrl: './about-us-add.css',
})
export class AboutUsAdd implements OnInit {
  private fb = inject(FormBuilder);
  private aboutUsApi = inject(AboutUsApiService);
  
  aboutUsToEdit = input<AboutUs | null>(null);

  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  aboutUsForm: FormGroup = this.fb.group({
    "hero_title[ar]": ['', [Validators.required, Validators.minLength(3)]],
    "hero_description[ar]": ['', [Validators.required, Validators.minLength(10)]],
    "vision[ar]": ['', [Validators.required, Validators.minLength(10)]],
    "mission[ar]": ['', [Validators.required, Validators.minLength(10)]],
    "goals[ar]": ['', [Validators.required, Validators.minLength(10)]],
    advantages: this.fb.array([], Validators.required),
    newAdvantage: ['']
  });

  get advantages(): FormArray {
    return this.aboutUsForm.get('advantages') as FormArray;
  }

  ngOnInit(): void {
    const item = this.aboutUsToEdit();
    if (item) {
      this.aboutUsForm.patchValue({
        "hero_title[ar]": item.hero_title,
        "hero_description[ar]": item.hero_description,
        "vision[ar]": item.vision,
        "mission[ar]": item.mission,
        "goals[ar]": item.goals
      });
      
      this.imagePreview.set(item.image);

      if (item.advantages && Array.isArray(item.advantages)) {
        item.advantages.forEach(adv => {
          this.advantages.push(this.fb.control(adv, Validators.required));
        });
      }
    }
  }

  addAdvantage(): void {
    const value = this.aboutUsForm.get('newAdvantage')?.value?.trim();
    if (value) {
      this.advantages.push(this.fb.control(value, Validators.required));
      this.aboutUsForm.get('newAdvantage')?.reset();
    }
  }

  removeAdvantage(index: number): void {
    this.advantages.removeAt(index);
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
    if (this.aboutUsForm.valid) {
      this.isLoading.set(true);
      const formData = new FormData();
      const rawValue = this.aboutUsForm.getRawValue();

      formData.append('hero_title[ar]', rawValue["hero_title[ar]"]);
      formData.append('hero_description[ar]', rawValue["hero_description[ar]"]);
      formData.append('vision[ar]', rawValue["vision[ar]"]);
      formData.append('mission[ar]', rawValue["mission[ar]"]);
      formData.append('goals[ar]', rawValue["goals[ar]"]);
      
      rawValue.advantages.forEach((adv: string) => {
        formData.append('advantages[ar][]', adv);
      });

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.aboutUsApi.saveAboutUs(formData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            Swal.fire({
              title: 'تم بنجاح!',
              text: 'تم تحديث تفاصيل "عن المركز" بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900'
            });
            this.onSaved.emit();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error updating About Us:', err);
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
      this.aboutUsForm.markAllAsTouched();
    }
  }


  close(): void {
    this.onClose.emit();
  }

  trackByFn(index: number): number {
    return index;
  }
}

