import { Component, input, output } from '@angular/core';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-services-table',
  imports: [],
  templateUrl: './services-table.html',
  styleUrl: './services-table.css',
})
export class ServicesTable {
  services = input<Service[]>([]);

  onDelete = output<number>();
  onEdit = output<Service>();

  editService(service: Service): void {
    this.onEdit.emit(service);
  }

  deleteService(id: number): void {
    console.log('Requesting delete for service ID:', id);
    this.onDelete.emit(id);
  }
}



