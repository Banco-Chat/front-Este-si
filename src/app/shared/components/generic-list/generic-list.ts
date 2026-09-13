import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardActionConfig, CardFieldConfig, GenericCard } from '@shared/components/generic-card/generic-card';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [CommonModule, GenericCard],
  templateUrl: './generic-list.html',
  host: { class: 'block' },
})
export class GenericList {
  @Input() items: any[] = [];
  @Input() title: string = '';
  @Input() emptyMessage: string = 'No hay elementos para mostrar';
  @Input() titleKey?: string;
  @Input() fallbackTitle: string = '';
  @Input() subtitleKey?: string;
  @Input() subtitleVariant: 'neutral' | 'positive' | 'negative' = 'neutral';
  @Input() progressKey?: string;
  @Input() fields: CardFieldConfig[] = [];
  @Input() actions: CardActionConfig[] = [];
  @Output() action = new EventEmitter<string>();
}
