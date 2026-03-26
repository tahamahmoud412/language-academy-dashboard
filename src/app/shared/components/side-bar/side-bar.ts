import { Component, signal } from '@angular/core';
import { NgOptimizedImage, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, NgClass],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
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
}
