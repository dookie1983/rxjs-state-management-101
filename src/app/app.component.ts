import { Component } from '@angular/core';
import { StoreService } from '../store/store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule],
})
export class AppComponent {
  title = 'rxjs-nemo-101';
  constructor(public store: StoreService) {
  }
}
