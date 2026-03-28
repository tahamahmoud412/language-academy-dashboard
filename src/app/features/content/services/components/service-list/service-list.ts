import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesTable } from '../../../../../shared/components/services-table/services-table';
import { ServicesHeader } from '../../../../../shared/components/services-header/services-header';
import { ServiceAdd } from '../service-add/service-add';
import { ServicesApiService } from '../../../../../core/services/services-api.service';
import { Service } from '../../../../../core/models/service.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [ServicesTable, ServicesHeader, ServiceAdd, CommonModule],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList implements OnInit {
  services = signal<Service[]>([]);
  totalServices = signal<number>(0);
  isAddServiceVisible = signal(false);
  selectedService = signal<Service | null>(null);

  constructor(private servicesApi: ServicesApiService) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.servicesApi.getServices().subscribe({
      next: (response) => {
        if (response.success) {
          this.services.set(response.data);
          this.totalServices.set(response.pagination?.total || response.data.length);
        }
      },
      error: (err) => console.error('Error fetching services:', err)
    });
  }

  openAddService(): void {
    this.selectedService.set(null);
    this.isAddServiceVisible.set(true);
  }

  openEditService(service: Service): void {
    this.selectedService.set(service);
    this.isAddServiceVisible.set(true);
  }

  closeAddService(): void {
    this.isAddServiceVisible.set(false);
    this.selectedService.set(null);
  }

  deleteService(id: number): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من استعادة هذه الخدمة بعد الحذف!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذفها!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicesApi.destroyService(id).subscribe({
          next: () => {
            this.services.update(prev => prev.filter(service => service.id !== id));
            this.totalServices.update(prev => prev - 1);

            Swal.fire({
              title: 'تم الحذف!',
              text: 'تم حذف الخدمة بنجاح.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error deleting service:', err);
            Swal.fire({
              title: 'خطأ!',
              text: 'حدث خطأ أثناء محاولة حذف الخدمة.',
              icon: 'error',
              confirmButtonText: 'حسناً'
            });
          }
        });
      }
    });
  }

}