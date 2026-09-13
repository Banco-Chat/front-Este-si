import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface SpendingByCategoryItem {
  categoryName: string;
  total: number;
}

interface ChartSegment {
  categoryName: string;
  total: number;
  percent: number;
  color: string;
}

/**
 * Paleta categórica validada (orden fijo, nunca ciclada) — ver dataviz skill,
 * references/palette.md. Pasa el gate CVD/contraste para el pairlist adyacente
 * (stacks/bars/lines) en las 8 posiciones.
 */
const CATEGORICAL_PALETTE = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
];
const OTHER_COLOR = '#898781'; // muted ink — "Otros" no es una serie con identidad propia
const MAX_SLOTS = CATEGORICAL_PALETTE.length;

@Component({
  selector: 'app-spending-by-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-by-category-list.html',
  styleUrl: './spending-by-category-list.css',
  host: { class: 'block' },
})
export class SpendingByCategoryList {
  @Input() items: SpendingByCategoryItem[] = [];

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  get segments(): ChartSegment[] {
    const total = this.total;
    if (!total) return [];

    const sorted = [...this.items].sort((a, b) => b.total - a.total);
    const head = sorted.slice(0, MAX_SLOTS);
    const rest = sorted.slice(MAX_SLOTS);

    const segments: ChartSegment[] = head.map((item, index) => ({
      categoryName: item.categoryName,
      total: item.total,
      percent: (item.total / total) * 100,
      color: CATEGORICAL_PALETTE[index],
    }));

    if (rest.length) {
      const otherTotal = rest.reduce((sum, item) => sum + item.total, 0);
      segments.push({
        categoryName: 'Otros',
        total: otherTotal,
        percent: (otherTotal / total) * 100,
        color: OTHER_COLOR,
      });
    }

    return segments;
  }

  segmentTooltip(segment: ChartSegment): string {
    return `${segment.categoryName}: ${this.formatCurrency(segment.total)} (${Math.round(segment.percent)}%)`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }
}
