import { Component, signal, inject, Input, Output, EventEmitter } from '@angular/core';
import { NgOptimizedImage, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, NgClass],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private openSections = signal<Record<string, boolean>>({
    courses: false,
    exams: false,
    content: false,
    aboutUs: false,
  });

  toggleSection(section: string) {
    this.openSections.update(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }

  isSectionOpen(section: string) {
    return this.openSections()[section];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/signin']);
  }
}
