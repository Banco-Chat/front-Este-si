import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-bank-transaction-item',
  styleUrl: './bank-transaction-item.css',
  templateUrl: './bank-transaction-item.html',
})
export class BankTransactionItem {
  @Input() type: string = '';
  @Input() description: string = '';
  @Input() date: string = '';
  @Input() amount: number = 0;
}
