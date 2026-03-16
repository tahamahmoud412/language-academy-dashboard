import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
