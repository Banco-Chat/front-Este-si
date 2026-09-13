import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-card',
  styleUrl: './card.css',
  templateUrl: './card.html',
})
export class Card {
  @Input() type: 'debito' | 'credito' | 'ahorro' = 'debito';
  @Input() alias: string = '';
  @Input() lastDigits: string = '4471';
  @Input() balance: number = 12300;
  @Input() isActive: boolean = true;
  @Input() isSelected: boolean = false;

  get typeLabel(): string {
    switch (this.type) {
      case 'credito': return 'Crédito';
      case 'ahorro': return 'Ahorro';
      default: return 'Débito';
    }
  }
}