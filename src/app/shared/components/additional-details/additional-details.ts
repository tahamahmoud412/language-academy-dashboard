import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-additional-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './additional-details.html',
  styleUrl: './additional-details.css',
})
export class AdditionalDetails {
  @Input() form!: FormGroup;
}
