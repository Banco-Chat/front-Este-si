import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-monthly-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-summary-card.html',
  styleUrl: './monthly-summary-card.css',
  host: { class: 'block' },
})
export class MonthlySummaryCard {
  @Input() month: string = '';
  @Input() income: number = 0;
  @Input() expenses: number = 0;
  @Input() savings: number = 0;

  get expensesShare(): number {
    if (!this.income) return 0;
    return Math.min(100, Math.max(0, (this.expenses / this.income) * 100));
  }

  get savingsRate(): number {
    if (!this.income) return 0;
    return Math.round((this.savings / this.income) * 100);
  }

  get formattedMonth(): string {
    if (!this.month) return '';
    const [year, month] = this.month.split('-').map(Number);
    if (!year || !month) return this.month;
    const date = new Date(year, month - 1, 1);
    const label = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
