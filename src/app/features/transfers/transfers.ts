import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { handleApiError } from '@helpers/error.helper';
import { Information } from '@services/information';
import { Transfers } from '@services/transfers';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { InlineSpinner } from '@shared/components/inline-spinner/inline-spinner';
import { Pagination } from '@shared/components/pagination/pagination';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { userAccounts } from '@stores/auth.store';
import Swal from 'sweetalert2';

function differentAccountsValidator(group: AbstractControl): ValidationErrors | null {
  const from = group.get('fromAccountId')?.value;
  const to = group.get('toAccountId')?.value;
  return from && to && String(from) === String(to) ? { sameAccount: true } : null;
}

@Component({
  standalone: true,
  selector: 'app-transfers',
  imports: [CommonModule, ReactiveFormsModule, ErrorMessages, Skeleton, InlineSpinner, Pagination],
  styleUrl: './transfers.css',
  templateUrl: './transfers.html',
})
export class TransfersPage implements OnInit {
  private transfersService = inject(Transfers);
  private informationService = inject(Information);
  private fb = inject(FormBuilder);

  accounts = computed(() => userAccounts());
  transfers = signal<any[]>([]);
  loading = signal(false);
  sending = signal(false);

  // PAGINACIÓN
  pagedItems = signal<any[]>([]);

  protected readonly skeletonRows = [1, 2, 3];
  transferForm: FormGroup;

  constructor() {
    this.transferForm = this.fb.group({
      fromAccountId: ['', Validators.required],
      toAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['']
    }, { validators: differentAccountsValidator });
  }

  ngOnInit() {
    this.loadTransfers();
  }

  get f() {
    return this.transferForm.controls;
  }

  updatePagedList(newList: any[]) {
    this.pagedItems.set(newList);
  }

  accountAlias(accountId: number): string {
    const account = this.accounts().find((acc: any) => acc.id === accountId);
    return account?.alias || `Cuenta #${accountId}`;
  }

  onSubmit() {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      Object.values(this.transferForm.controls).forEach(control => {
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const raw = this.transferForm.value;
    const payload = {
      fromAccountId: Number(raw.fromAccountId),
      toAccountId: Number(raw.toAccountId),
      amount: Number(raw.amount),
      description: raw.description || undefined
    };

    this.sending.set(true);
    this.transfersService.create(payload).subscribe({
      next: (response) => {
        this.sending.set(false);
        if (response.success && response.data) {
          this.transferForm.reset();
          this.transferForm.markAsPristine();
          this.transferForm.markAsUntouched();
          this.transfers.update(list => [response.data, ...list]);
          this.refreshAccounts();

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
            title: 'Transferencia realizada correctamente.'
          });
        }
      },
      error: (error) => {
        this.sending.set(false);
        handleApiError(error, 'No se pudo completar la transferencia.');
      }
    });
  }

  private loadTransfers() {
    this.loading.set(true);

    this.transfersService.getAll().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.transfers.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        handleApiError(error);
      }
    });
  }

  private refreshAccounts() {
    this.informationService.getAccountInformation().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          userAccounts.set(Array.isArray(response.data) ? response.data : [response.data]);
        }
      },
      error: (error) => handleApiError(error)
    });
  }
}
