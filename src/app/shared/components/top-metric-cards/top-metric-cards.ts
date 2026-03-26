import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-top-metric-cards',
  imports: [NgOptimizedImage],
  templateUrl: './top-metric-cards.html',
  styleUrl: './top-metric-cards.css',
})
export class TopMetricCards {
  totalServices = input<number>(0);
}


