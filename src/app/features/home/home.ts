import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { handleApiError } from '@helpers/error.helper';
import { Information } from '@services/information';
import { Card } from '@shared/components/card/card';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { InlineSpinner } from '@shared/components/inline-spinner/inline-spinner';
import { MonthlySummaryCard } from '@shared/components/monthly-summary-card/monthly-summary-card';
import { ResumeItem } from '@shared/components/resume-item/resume-item';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SpendingByCategoryList } from '@shared/components/spending-by-category-list/spending-by-category-list';
import { currentUser, userAccounts } from '@stores/auth.store';
import { categories } from '@stores/information.store';
import { accountTypeOpt, FilterOption } from '../../core/interfaces/filters';
import { BankTransactionItem } from '@shared/components/bank-transaction-item/bank-transaction-item';
import { Pagination } from '@shared/components/pagination/pagination';
import Swal from 'sweetalert2';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorMessages, Card, ResumeItem, BankTransactionItem, Pagination, Skeleton, InlineSpinner, MonthlySummaryCard, SpendingByCategoryList],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  informationService = inject(Information);
  router = inject(Router);
  fb = inject(FormBuilder);

  sending = signal(false);
  fechaHoy: string = '';
  saludo: string = '';
  cardForm: FormGroup;

  user = computed(() => currentUser());

  // PAGINACIÓN
  pagedItems = signal<any[]>([]);

  userAccountsData = computed(() => {
    const raw = userAccounts();
    const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    return list.map((acc: any) => ({
      ...acc,
      currentBalance: Number(acc.currentBalance ?? 0),
      typeAccount: acc.typeAccount?.toLowerCase() === 'debit' ? 'debito' : (acc.typeAccount?.toLowerCase() || 'debito')
    }));
  });

  categoriesData = computed(() => {
    const cats = categories();
    return Array.isArray(cats) ? cats : [];
  });

  selectedAccountId = signal<number | null>(null);
  transactions = signal<any[]>([]);
  loadingTransactions = signal(false);
  selectedCategoryId = signal<number | 'all'>('all');
  protected readonly skeletonRows = [1, 2, 3, 4];

  monthlySummary = signal<{ month: string; income: number; expenses: number; savings: number } | null>(null);
  spendingByCategory = signal<any[]>([]);
  loadingSummary = signal(false);

  filteredTransactions = computed(() => {
    const categoryId = this.selectedCategoryId();
    const txs = this.transactions();
    const safeTxs = Array.isArray(txs) ? txs : [];
    return categoryId === 'all' ? safeTxs : safeTxs.filter((t) => t.categoryId === categoryId);
  });

  protected readonly accountTypes: FilterOption[] = accountTypeOpt;

  constructor() {
    this.cardForm = this.fb.group({
      typeAccount: ['', Validators.required],
      alias: ['', Validators.required],
      last4Digits: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]*$')]],
      isActive: [true, Validators.required]
    });
  }

  ngOnInit() {
    const hoy = new Date();
    const fecha = hoy.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const fechaCompleta = fecha.replace(/\sde\s/g, ' ');
    this.fechaHoy = this.capitalizar(fechaCompleta);

    const hora = hoy.getHours();
    if (hora >= 5 && hora < 12) {
      this.saludo = 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
      this.saludo = 'Buenas tardes';
    } else {
      this.saludo = 'Buenas noches';
    }

    const accounts = this.userAccountsData();
    if (accounts.length > 0) {
      this.selectAccount(accounts[0]);
    }
  }

  get f() {
    return this.cardForm.controls;
  }

  updatePagedList(newList: any[]) {
    this.pagedItems.set(newList);
  }

  capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  goToAssistant() {
    this.router.navigate(['/assistant']);
  }

  private isDraggingAccounts = false;
  private dragStartX = 0;
  private dragScrollStart = 0;
  private dragMoved = false;

  startAccountsDrag(event: MouseEvent, el: HTMLElement) {
    this.isDraggingAccounts = true;
    this.dragMoved = false;
    this.dragStartX = event.pageX;
    this.dragScrollStart = el.scrollLeft;
  }

  moveAccountsDrag(event: MouseEvent, el: HTMLElement) {
    if (!this.isDraggingAccounts) return;
    event.preventDefault();
    const delta = event.pageX - this.dragStartX;
    if (Math.abs(delta) > 5) this.dragMoved = true;
    el.scrollLeft = this.dragScrollStart - delta;
  }

  endAccountsDrag() {
    this.isDraggingAccounts = false;
  }

  onAccountClick(account: any) {
    if (this.dragMoved) return;
    this.selectAccount(account);
  }

  selectAccount(account: any) {
    this.selectedAccountId.set(account.id);
    this.loadingTransactions.set(true);
    this.loadingSummary.set(true);

    this.informationService.getAccountTransactions(account.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.transactions.set(Array.isArray(response.data) ? response.data : []);
        }
        this.loadingTransactions.set(false);
      },
      error: (error) => {
        this.loadingTransactions.set(false);
        handleApiError(error);
      }
    });

    const { month, from, to } = this.currentMonthRange();

    this.informationService.getMonthlySummary(account.id, month).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.monthlySummary.set(response.data);
        }
      },
      error: (error) => handleApiError(error)
    });

    this.informationService.getSpendingByCategory(account.id, from, to).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.spendingByCategory.set(response.data);
        }
        this.loadingSummary.set(false);
      },
      error: (error) => {
        this.loadingSummary.set(false);
        handleApiError(error);
      }
    });
  }

  private currentMonthRange(): { month: string; from: string; to: string } {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    const month = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const from = new Date(year, monthIndex, 1).toISOString().slice(0, 10);
    const to = new Date(year, monthIndex + 1, 0).toISOString().slice(0, 10);

    return { month, from, to };
  }

  selectCategory(categoryId: number | 'all') {
    if (this.dragMoved) return;
    this.selectedCategoryId.set(categoryId);
  }

  openAccountModal() {
    const modal = document.getElementById('cardModal') as HTMLDialogElement;
    modal?.showModal();
  }

  closeAccountModal() {
    const modal = document.getElementById('cardModal') as HTMLDialogElement;
    modal?.close();
  }

  onSubmit() {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      Object.values(this.cardForm.controls).forEach(control => {
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const rawVal = this.cardForm.value;
    const payload = {
      ...rawVal,
      isActive: rawVal.isActive === 'true' || rawVal.isActive === true
    };

    this.sending.set(true);
    this.informationService.newAccount(payload).subscribe({
      next: (response) => {
        this.sending.set(false);
        if (response.success) {
          this.closeAccountModal();
          this.cardForm.reset({ isActive: true });
          this.cardForm.markAsPristine();
          this.cardForm.markAsUntouched();

          Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          }).fire({
            icon: "success",
            title: "Cuenta agregada correctamente."
          });
          
          this.informationService.getAccountInformation().subscribe({
            next: (res) => {
              if (res.success && res.data) {
                const arr = Array.isArray(res.data) ? res.data : [res.data];
                userAccounts.set(arr);
              }
            },
            error: (error) => {
              console.error('Error al recargar cuentas:', error);
            }
          });
        }
      },
      error: (error) => {
        this.sending.set(false);
        this.closeAccountModal();
        handleApiError(error);
      }
    });
  }
}