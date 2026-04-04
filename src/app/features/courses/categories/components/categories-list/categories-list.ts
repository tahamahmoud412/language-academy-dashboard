import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCategory } from '../../../../../core/models/category.model';
import { CategoriesAdd } from '../categories-add/categories-add';
import { CourseCategoryApiService } from '../../../../../core/services/course-category-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, CategoriesAdd, ],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.css',
})
export class CategoriesList implements OnInit {
  private categoryApi = inject(CourseCategoryApiService);
  categories = signal<CourseCategory[]>([]);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryApi.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }


  isAddVisible = signal(false);
  selectedCategory = signal<CourseCategory | null>(null);

  totalCategories = () => this.categories().length;

  openAdd() {
    this.selectedCategory.set(null);
    this.isAddVisible.set(true);
  }

  openEdit(category: CourseCategory) {
    this.selectedCategory.set(category);
    this.isAddVisible.set(true);
  }

  closeAdd() {
    this.isAddVisible.set(false);
  }

  deleteCategory(id: number | undefined) {
    if (!id) return;
    
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف هذا التصنيف نهائياً!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6900',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryApi.deleteCategory(id).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadCategories();
              Swal.fire({
                title: 'تم الحذف!',
                text: 'تم حذف التصنيف بنجاح.',
                icon: 'success',
                confirmButtonColor: '#FF6900',
                confirmButtonText: 'حسناً'
              });
            }
          },
          error: (err) => {
            console.error('Error deleting category:', err);
            Swal.fire({
              title: 'خطأ!',
              text: 'حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.',
              icon: 'error',
              confirmButtonColor: '#FF6900',
              confirmButtonText: 'حسناً'
            });
          }
        });
      }
    });
  }

  handleSaved() {
    this.loadCategories();
    this.closeAdd();
  }
}

