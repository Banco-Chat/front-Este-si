import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BankTransactionItem } from '@shared/components/bank-transaction-item/bank-transaction-item';

@Component({
  imports: [CommonModule, BankTransactionItem],
  selector: 'app-bank-transactions',
  styleUrl: './bank-transactions.css',
  templateUrl: './bank-transactions.html',
})
export class BankTransactions {}
