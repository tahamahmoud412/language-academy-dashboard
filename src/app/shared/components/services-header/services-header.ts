import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-services-header',
  imports: [],
  templateUrl: './services-header.html',
  styleUrl: './services-header.css',
})
export class ServicesHeader {
  totalServices = input<number>(0);
  onAddService = output<void>();

  addService(): void {
    this.onAddService.emit();
  }
}


