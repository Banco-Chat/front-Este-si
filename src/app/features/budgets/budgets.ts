import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { handleApiError } from '@helpers/error.helper';
import { Budgets as BudgetsService } from '@services/budgets';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { InlineSpinner } from '@shared/components/inline-spinner/inline-spinner';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { userAccounts } from '@stores/auth.store';
import { categories } from '@stores/information.store';
import { catchError, forkJoin, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-budgets',
  imports: [CommonModule, ReactiveFormsModule, ErrorMessages, Skeleton, InlineSpinner],
  styleUrl: './budgets.css',
  templateUrl: './budgets.html',
})
export class BudgetsPage implements OnInit {
  private budgetsService = inject(BudgetsService);
  private fb = inject(FormBuilder);

  accounts = computed(() => userAccounts());
  categoriesData = computed(() => {
    const cats = categories();
    return Array.isArray(cats) ? cats : [];
  });

  selectedAccountId = signal<number | null>(null);
  budgets = signal<any[]>([]);
  loading = signal(false);
  sending = signal(false);

  protected readonly skeletonCards = [1, 2, 3];
  budgetForm: FormGroup;

  constructor() {
    this.budgetForm = this.fb.group({
      categoryId: ['', Validators.required],
      limitAmount: ['', [Validators.required, Validators.min(1)]],
      startPeriod: ['', Validators.required],
      endPeriod: ['', Validators.required],
    });
  }

  ngOnInit() {
    const accounts = this.accounts();
    if (accounts.length > 0) {
      this.selectAccount(accounts[0].id);
    }
  }

  get f() {
    return this.budgetForm.controls;
  }

  selectAccount(accountId: number) {
    this.selectedAccountId.set(accountId);
    this.loading.set(true);

    this.budgetsService.getByAccount(accountId).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.loadStatuses(response.data);
        } else {
          this.budgets.set([]);
          this.loading.set(false);
        }
      },
      error: (error) => {
        this.loading.set(false);
        handleApiError(error);
      }
    });
  }

  private loadStatuses(budgetList: any[]) {
    if (!budgetList.length) {
      this.budgets.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin(
      budgetList.map(budget =>
        this.budgetsService.getStatus(budget.id).pipe(
          map(response => response.success && response.data ? { ...budget, ...response.data } : budget),
          catchError(() => of(budget))
        )
      )
    ).subscribe(merged => {
      this.budgets.set(merged);
      this.loading.set(false);
    });
  }

  progressPercent(budget: any): number {
    if (budget.percentage !== undefined && budget.percentage !== null) {
      return Math.min(100, Math.max(0, Number(budget.percentage)));
    }
    const limit = Number(budget.limitAmount);
    if (!limit) return 0;
    return Math.min(100, Math.max(0, (Number(budget.spent) / limit) * 100));
  }

  progressVariant(budget: any): 'ok' | 'warn' | 'over' {
    const percent = this.progressPercent(budget);
    if (percent >= 100) return 'over';
    if (percent >= 80) return 'warn';
    return 'ok';
  }

  openBudgetModal() {
    const modal = document.getElementById('budgetModal') as HTMLDialogElement;
    modal?.showModal();
  }

  closeBudgetModal() {
    const modal = document.getElementById('budgetModal') as HTMLDialogElement;
    modal?.close();
  }

  onSubmit() {
    const accountId = this.selectedAccountId();
    if (this.budgetForm.invalid || !accountId) {
      this.budgetForm.markAllAsTouched();
      Object.values(this.budgetForm.controls).forEach(control => {
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.sending.set(true);
    const payload = {
      ...this.budgetForm.value,
      categoryId: Number(this.budgetForm.value.categoryId),
      limitAmount: Number(this.budgetForm.value.limitAmount),
    };

    this.budgetsService.create(accountId, payload).subscribe({
      next: (response) => {
        this.sending.set(false);
        if (response.success && response.data) {
          this.closeBudgetModal();
          this.budgetForm.reset();
          this.budgetForm.markAsPristine();
          this.budgetForm.markAsUntouched();
          this.budgets.update(list => [{ ...response.data, spent: 0, remaining: response.data.limitAmount, percentage: 0 }, ...list]);

          Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          }).fire({
            icon: 'success',
            title: 'Presupuesto creado correctamente.'
          });
        }
      },
      error: (error) => {
        this.sending.set(false);
        handleApiError(error);
      }
    });
  }
}
