import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AboutUs } from '../../../../../core/models/about-us.model';
import { AboutUsAdd } from '../about-us-add/about-us-add';
import { AboutUsApiService } from '../../../../../core/services/about-us-api.service';
import Swal from 'sweetalert2';
import { TopMetricCards } from '../../../../../shared/components/top-metric-cards/top-metric-cards';

@Component({
  selector: 'app-about-us-list',
  standalone: true,
  imports: [CommonModule, AboutUsAdd, NgOptimizedImage, TopMetricCards],

  templateUrl: './about-us-list.html',
  styleUrl: './about-us-list.css',
})
export class AboutUsList implements OnInit {
  private aboutUsApi = inject(AboutUsApiService);
  aboutUsData = signal<AboutUs | null>(null);

  isAddVisible = signal(false);
  selectedItem = signal<AboutUs | null>(null);

  ngOnInit() {
    this.loadAboutUs();
  }

  loadAboutUs() {
    this.aboutUsApi.getAboutUs().subscribe({
      next: (response) => {
        if (response.success) {
          this.aboutUsData.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading about us:', err);
      }
    });
  }

  openEdit() {
    this.selectedItem.set(this.aboutUsData());
    this.isAddVisible.set(true);
  }

  closeAdd() {
    this.isAddVisible.set(false);
  }

  handleSaved() {
    this.loadAboutUs();
    this.closeAdd();
  }
}
