import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-resume-item',
  styleUrl: './resume-item.css',
  templateUrl: './resume-item.html',
})
export class ResumeItem {
  @Input() title: string = '';
  @Input() price: number = 0;
}
