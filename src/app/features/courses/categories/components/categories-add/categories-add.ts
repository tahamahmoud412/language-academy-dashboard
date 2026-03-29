import { Component, Output, EventEmitter, inject, signal, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseCategory } from '../../../../../core/models/category.model';
import { CourseCategoryApiService } from '../../../../../core/services/course-category-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories-add.html',
  styleUrl: './categories-add.css',
})
export class CategoriesAdd implements OnInit {
  private fb = inject(FormBuilder);
  private categoryApi = inject(CourseCategoryApiService);
  
  categoryToEdit = input<CourseCategory | null>(null);

  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  isLoading = signal(false);

  categoryForm: FormGroup = this.fb.group({
    "name[ar]": ['', [Validators.required, Validators.minLength(2)]],
    sort_order: [1, [Validators.required, Validators.min(1)]],
    is_active: [1, Validators.required]
  });

  ngOnInit(): void {
    const category = this.categoryToEdit();
    if (category) {
      this.categoryForm.patchValue({
        "name[ar]": category.name,
        sort_order: category.sort_order,
        is_active: category.is_active ? 1 : 0
      });
    }
  }

  save(): void {
    if (this.categoryForm.valid) {
      this.isLoading.set(true);
      const formData = new FormData();
      const rawValue = this.categoryForm.value;

      formData.append('name[ar]', rawValue['name[ar]']);
      formData.append('sort_order', rawValue.sort_order.toString());
      formData.append('is_active', rawValue.is_active.toString());

      const editingCategory = this.categoryToEdit();
      const request = editingCategory?.id 
        ? this.categoryApi.updateCategory(editingCategory.id, formData)
        : this.categoryApi.createCategory(formData);

      request.subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            Swal.fire({
              title: 'تم بنجاح!',
              text: editingCategory ? 'تم تحديث التصنيف بنجاح.' : 'تمت إضافة التصنيف بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسناً',
              confirmButtonColor: '#FF6900'
            });
            this.onSaved.emit();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error saving category:', err);
          Swal.fire({
            title: 'خطأ!',
            text: 'حدث خطأ أثناء حفظ التصنيف. يرجى المحاولة مرة أخرى.',
            icon: 'error',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#FF6900'
          });
        }
      });
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  close(): void {
    this.onClose.emit();
  }
}

