import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  data = input<any[]>([]); 
  perPage = input<number>(5);
  pageChanged = output<any[]>();
  p = signal(1);

  totalPages = computed(() => Math.ceil(this.data().length / this.perPage()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.p();
    const pages: (number | string)[] = [];
    const delta = 1;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);
    if (current <= 3) end = 4;
    if (current >= total - 2) start = total - 3;

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
    pages.push('...');
    }

    pages.push(total);
    
    return pages;
  });
  
  startIndex = computed(() => {
    if (this.data().length === 0) return 0;
    return (this.p() - 1) * this.perPage() + 1;
  });

  endIndex = computed(() => {
    const total = this.data().length;
    if (total === 0) return 0;
    const end = this.p() * this.perPage();
    return end > total ? total : end;
  });

  constructor() {
    effect(() => {
      const current = this.p();
      const total = this.totalPages();

      if (current > total && total >= 1) {
        this.p.set(total);
      }
    });

    effect(() => {
      const start = (this.p() - 1) * this.perPage();
      const slicedData = this.data().slice(start, start + this.perPage());
      this.pageChanged.emit(slicedData);
    });
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.p.set(page);
    }
  }
}
