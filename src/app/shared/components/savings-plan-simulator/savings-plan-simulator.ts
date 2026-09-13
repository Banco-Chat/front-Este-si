import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SavingsPlanOption {
  months: number;
  monthlyContribution: number;
}

@Component({
  selector: 'app-savings-plan-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './savings-plan-simulator.html',
  styleUrl: './savings-plan-simulator.css',
  host: { class: 'block' },
})
export class SavingsPlanSimulator {
  @Input() targetAmount: number = 0;
  @Input() options: SavingsPlanOption[] = [];
  @Output() action = new EventEmitter<string>();

  choose(option: SavingsPlanOption) {
    this.action.emit(`Sí, crea la meta con el plan de ${option.months} meses`);
  }
}
