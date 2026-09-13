import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { handleApiError } from '@helpers/error.helper';
import { SavingsGoals } from '@services/savings-goals';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { InlineSpinner } from '@shared/components/inline-spinner/inline-spinner';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { userAccounts } from '@stores/auth.store';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-savings-goals',
  imports: [CommonModule, ReactiveFormsModule, ErrorMessages, Skeleton, InlineSpinner],
  styleUrl: './savings-goals.css',
  templateUrl: './savings-goals.html',
})
export class SavingsGoalsPage implements OnInit {
  private savingsGoalsService = inject(SavingsGoals);
  private fb = inject(FormBuilder);

  accounts = computed(() => userAccounts());
  selectedAccountId = signal<number | null>(null);
  goals = signal<any[]>([]);
  loading = signal(false);
  sending = signal(false);
  contributing = signal(false);
  selectedGoal = signal<any | null>(null);

  protected readonly skeletonCards = [1, 2, 3];
  goalForm: FormGroup;
  contributeForm: FormGroup;

  constructor() {
    this.goalForm = this.fb.group({
      name: ['', Validators.required],
      targetAmount: ['', [Validators.required, Validators.min(1)]]
    });

    this.contributeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    const accounts = this.accounts();
    if (accounts.length > 0) {
      this.selectAccount(accounts[0].id);
    }
  }

  get f() {
    return this.goalForm.controls;
  }

  get cf() {
    return this.contributeForm.controls;
  }

  selectAccount(accountId: number) {
    this.selectedAccountId.set(accountId);
    this.loading.set(true);

    this.savingsGoalsService.getByAccount(accountId).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.goals.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        handleApiError(error);
      }
    });
  }

  progressPercent(goal: any): number {
    const target = Number(goal.targetAmount);
    if (!target) return 0;
    return Math.min(100, Math.max(0, (Number(goal.actualAmount) / target) * 100));
  }

  openGoalModal() {
    const modal = document.getElementById('goalModal') as HTMLDialogElement;
    modal?.showModal();
  }

  closeGoalModal() {
    const modal = document.getElementById('goalModal') as HTMLDialogElement;
    modal?.close();
  }

  onSubmit() {
    const accountId = this.selectedAccountId();
    if (this.goalForm.invalid || !accountId) {
      this.goalForm.markAllAsTouched();
      Object.values(this.goalForm.controls).forEach(control => {
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.sending.set(true);
    this.savingsGoalsService.create(accountId, this.goalForm.value).subscribe({
      next: (response) => {
        this.sending.set(false);
        if (response.success && response.data) {
          this.closeGoalModal();
          this.goalForm.reset();
          this.goalForm.markAsPristine();
          this.goalForm.markAsUntouched();
          this.goals.update(list => [response.data, ...list]);

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
            title: 'Meta creada correctamente.'
          });
        }
      },
      error: (error) => {
        this.sending.set(false);
        handleApiError(error);
      }
    });
  }

  openContributeModal(goal: any) {
    this.selectedGoal.set(goal);
    this.contributeForm.reset();

    const modal = document.getElementById('contributeModal') as HTMLDialogElement;
    modal?.showModal();
  }

  closeContributeModal() {
    const modal = document.getElementById('contributeModal') as HTMLDialogElement;
    modal?.close();
  }

  onContributeSubmit() {
    const goal = this.selectedGoal();
    if (this.contributeForm.invalid || !goal) {
      this.contributeForm.markAllAsTouched();
      Object.values(this.contributeForm.controls).forEach(control => {
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.contributing.set(true);
    const amount = Number(this.contributeForm.value.amount);

    this.savingsGoalsService.contribute(goal.id, amount).subscribe({
      next: (response) => {
        this.contributing.set(false);
        if (response.success && response.data) {
          this.closeContributeModal();
          this.goals.update(list => list.map(g => g.id === goal.id ? response.data : g));

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
            title: 'Aporte registrado.'
          });
        }
      },
      error: (error) => {
        this.contributing.set(false);
        handleApiError(error);
      }
    });
  }
}
