import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineEvent } from '../../../../../core/models/event.model';
import { EventAdd } from '../event-add/event-add';
import { EventApiService } from '../../../../../core/services/event-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventAdd],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  private eventApi = inject(EventApiService);
  events = signal<TimelineEvent[]>([]);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventApi.getEvents().subscribe({
      next: (response) => {
        if (response.success) {
          this.events.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading events:', err);
      }
    });
  }


  isAddEventVisible = signal(false);
  selectedEvent = signal<TimelineEvent | null>(null);

  totalEvents = () => this.events().length;

  openAddEvent() {
    this.selectedEvent.set(null);
    this.isAddEventVisible.set(true);
  }

  openEditEvent(event: TimelineEvent) {
    this.selectedEvent.set(event);
    this.isAddEventVisible.set(true);
  }

  closeAddEvent() {
    this.isAddEventVisible.set(false);
  }

  deleteEvent(id: number) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة هذا الحدث بعد الحذف!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6900',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، احذفه!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.eventApi.deleteEvent(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم الحذف!',
              text: 'تم حذف الحدث بنجاح.',
              icon: 'success',
              confirmButtonColor: '#FF6900',
              confirmButtonText: 'حسناً'
            });
            this.loadEvents();
          },
          error: (err) => {
            console.error('Error deleting event:', err);
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

  handleEventSaved() {
    this.loadEvents();
    this.closeAddEvent();
  }

}
