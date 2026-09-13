import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
  host: { class: 'block' },
})
export class Skeleton {
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() rounded: string = 'rounded-md';
}
