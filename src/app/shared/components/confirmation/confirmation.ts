import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule],
  templateUrl: './confirmation.html',
  styles: ``,
  standalone: true,
})
export class Confirmation {
  visible = model<boolean>(false);
  title = input<string>('Confirmation');
  message = input<string>('Are you sure you want to proceed?');
  icon = input<string>(''); // e.g., 'pi pi-exclamation-triangle'
  acceptLabel = input<string>('Yes');
  rejectLabel = input<string>('No');
  type = input<'success' | 'danger' | 'warning' | 'info'>('warning');
  showButtons = input<boolean>(true);

  onConfirm = output<void>();
  onCancel = output<void>();

  close() {
    this.visible.set(false);
  }

  confirm() {
    this.onConfirm.emit();
    this.close();
  }

  cancel() {
    this.onCancel.emit();
    this.close();
  }
}
