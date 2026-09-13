import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-chatbubble',
  styleUrl: './chatbubble.css',
  templateUrl: './chatbubble.html',
  host: { class: 'block' },
})
export class Chatbubble {
  @Input() message: string = '';
  @Input() direction: 'incoming' | 'outgoing' = 'incoming';
}
