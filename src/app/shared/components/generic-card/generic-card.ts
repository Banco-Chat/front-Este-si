import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export interface CardFieldConfig {
  key: string;
  label: string;
  format?: 'currency' | 'date' | 'percent' | 'text';
}

export interface CardActionConfig {
  label: string;
  requiresAmount?: boolean;
  amountLabel?: string;
  buildMessage: (data: any, amount?: number) => string;
}

@Component({
  selector: 'app-generic-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-card.html',
  styleUrl: './generic-card.css',
  host: { class: 'block' },
})
export class GenericCard {
  @Input() data: any = {};
  @Input() titleKey?: string;
  @Input() fallbackTitle: string = '';
  @Input() subtitleKey?: string;
  @Input() subtitleVariant: 'neutral' | 'positive' | 'negative' = 'neutral';
  @Input() progressKey?: string;
  @Input() fields: CardFieldConfig[] = [];
  @Input() actions: CardActionConfig[] = [];
  @Output() action = new EventEmitter<string>();

  amounts = signal<Record<string, number>>({});

  get subtitlePillClass(): string {
    switch (this.subtitleVariant) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-600';
      case 'negative':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-(--primary-color)/10 text-(--primary-color)';
    }
  }

  clampPercent(value: any): number {
    return Math.min(100, Math.max(0, Number(value) || 0));
  }

  onAmountInput(actionLabel: string, value: number) {
    this.amounts.update(current => ({ ...current, [actionLabel]: value }));
  }

  isAmountValid(actionLabel: string): boolean {
    return (this.amounts()[actionLabel] || 0) > 0;
  }

  runAction(actionConfig: CardActionConfig, amount?: number) {
    if (actionConfig.requiresAmount && (!amount || amount <= 0)) return;
    this.action.emit(actionConfig.buildMessage(this.data, amount));
  }
}
