import { Type } from '@angular/core';
import { userAccounts } from '@stores/auth.store';
import { CardActionConfig, CardFieldConfig, GenericCard } from '@shared/components/generic-card/generic-card';
import { GenericList } from '@shared/components/generic-list/generic-list';
import { MonthlySummaryCard } from '@shared/components/monthly-summary-card/monthly-summary-card';
import { SavingsPlanSimulator } from '@shared/components/savings-plan-simulator/savings-plan-simulator';
import { SpendingByCategoryList } from '@shared/components/spending-by-category-list/spending-by-category-list';

/**
 * Registro que mapea cada uno de los 13 `component` del contrato A2UI
 * a la pieza de Angular que lo renderiza y a cómo traducir sus `props`
 * a los inputs de esa pieza. La mayoría reutiliza GenericCard/GenericList;
 * solo SavingsPlanSimulator, MonthlySummaryCard y SpendingByCategoryList
 * tienen componente propio.
 */
export interface A2uiRegistryEntry {
  component: Type<any>;
  mapInputs: (props: any) => Record<string, any>;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
  CASH: 'Efectivo',
  SAVINGS: 'Ahorros',
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
};

function accountAlias(accountId: number): string {
  const raw = userAccounts();
  const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  const found = list.find((acc: any) => acc.id === accountId);
  return found?.alias || `Cuenta #${accountId}`;
}

function withAccountLabel(account: any) {
  return { ...account, typeAccount: ACCOUNT_TYPE_LABELS[account.typeAccount] || account.typeAccount };
}

function withTransactionLabel(transaction: any) {
  return { ...transaction, type: TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type };
}

function withTransferAliases(transfer: any) {
  return {
    ...transfer,
    fromAccountId: accountAlias(transfer.fromAccountId),
    toAccountId: accountAlias(transfer.toAccountId),
  };
}

function transactionSubtitleVariant(type: string): 'positive' | 'negative' | 'neutral' {
  if (type === 'INCOME') return 'positive';
  if (type === 'EXPENSE') return 'negative';
  return 'neutral';
}

const savingsGoalFields: CardFieldConfig[] = [
  { key: 'targetAmount', label: 'Meta', format: 'currency' },
  { key: 'actualAmount', label: 'Ahorrado', format: 'currency' },
];

const savingsGoalActions: CardActionConfig[] = [
  {
    label: 'Aportar',
    requiresAmount: true,
    amountLabel: 'Monto a aportar',
    buildMessage: (data, amount) => `Aporta ${amount} a mi meta ${data.name}`,
  },
];

const transactionFields: CardFieldConfig[] = [
  { key: 'amount', label: 'Monto', format: 'currency' },
  { key: 'date', label: 'Fecha', format: 'date' },
  { key: 'description', label: 'Descripción' },
];

const budgetFields: CardFieldConfig[] = [
  { key: 'limitAmount', label: 'Límite', format: 'currency' },
  { key: 'startPeriod', label: 'Desde', format: 'date' },
  { key: 'endPeriod', label: 'Hasta', format: 'date' },
];

const budgetStatusFields: CardFieldConfig[] = [
  { key: 'limitAmount', label: 'Límite', format: 'currency' },
  { key: 'spent', label: 'Gastado', format: 'currency' },
  { key: 'remaining', label: 'Disponible', format: 'currency' },
];

const transferFields: CardFieldConfig[] = [
  { key: 'amount', label: 'Monto', format: 'currency' },
  { key: 'fromAccountId', label: 'Origen' },
  { key: 'toAccountId', label: 'Destino' },
  { key: 'date', label: 'Fecha', format: 'date' },
];

export const A2UI_REGISTRY: Record<string, A2uiRegistryEntry> = {
  AccountsList: {
    component: GenericList,
    mapInputs: (props) => ({
      items: (props.accounts || []).map(withAccountLabel),
      title: 'Tus cuentas',
      emptyMessage: 'No tienes cuentas registradas',
      titleKey: 'alias',
      subtitleKey: 'typeAccount',
      fields: [{ key: 'currentBalance', label: 'Saldo', format: 'currency' }],
    }),
  },

  SavingsPlanSimulator: {
    component: SavingsPlanSimulator,
    mapInputs: (props) => ({
      targetAmount: props.targetAmount,
      options: props.options || [],
    }),
  },

  SavingsGoalCard: {
    component: GenericCard,
    mapInputs: (props) => ({
      data: props,
      titleKey: 'name',
      progressKey: 'progressPercent',
      fields: savingsGoalFields,
      actions: savingsGoalActions,
    }),
  },

  SavingsGoalsList: {
    component: GenericList,
    mapInputs: (props) => ({
      items: props.goals || [],
      title: 'Tus metas de ahorro',
      emptyMessage: 'No tienes metas de ahorro',
      titleKey: 'name',
      progressKey: 'progressPercent',
      fields: savingsGoalFields,
      actions: savingsGoalActions,
    }),
  },

  TransactionCard: {
    component: GenericCard,
    mapInputs: (props) => ({
      data: withTransactionLabel(props),
      titleKey: 'categoryName',
      fallbackTitle: 'Movimiento',
      subtitleKey: 'type',
      subtitleVariant: transactionSubtitleVariant(props.type),
      fields: transactionFields,
    }),
  },

  TransactionsList: {
    component: GenericList,
    mapInputs: (props) => ({
      items: (props.transactions || []).map(withTransactionLabel),
      title: 'Movimientos',
      emptyMessage: 'No hay movimientos para mostrar',
      titleKey: 'categoryName',
      fallbackTitle: 'Movimiento',
      subtitleKey: 'type',
      subtitleVariant: 'neutral',
      fields: transactionFields,
    }),
  },

  MonthlySummaryCard: {
    component: MonthlySummaryCard,
    mapInputs: (props) => ({
      month: props.month,
      income: props.income,
      expenses: props.expenses,
      savings: props.savings,
    }),
  },

  SpendingByCategoryList: {
    component: SpendingByCategoryList,
    mapInputs: (props) => ({
      items: props.items || [],
    }),
  },

  BudgetCard: {
    component: GenericCard,
    mapInputs: (props) => ({
      data: props,
      titleKey: 'categoryName',
      fallbackTitle: 'Presupuesto',
      fields: budgetFields,
    }),
  },

  BudgetsList: {
    component: GenericList,
    mapInputs: (props) => ({
      items: props.budgets || [],
      title: 'Tus presupuestos',
      emptyMessage: 'No tienes presupuestos registrados',
      titleKey: 'categoryName',
      fallbackTitle: 'Presupuesto',
      fields: budgetFields,
    }),
  },

  BudgetStatusCard: {
    component: GenericCard,
    mapInputs: (props) => ({
      data: props,
      titleKey: 'categoryName',
      fallbackTitle: 'Presupuesto',
      progressKey: 'percentage',
      fields: budgetStatusFields,
    }),
  },

  TransferCard: {
    component: GenericCard,
    mapInputs: (props) => ({
      data: withTransferAliases(props),
      titleKey: 'description',
      fallbackTitle: 'Transferencia',
      fields: transferFields,
    }),
  },

  TransfersList: {
    component: GenericList,
    mapInputs: (props) => ({
      items: (props.transfers || []).map(withTransferAliases),
      title: 'Tus transferencias',
      emptyMessage: 'No tienes transferencias registradas',
      titleKey: 'description',
      fallbackTitle: 'Transferencia',
      fields: transferFields,
    }),
  },
};

export function resolveA2uiEntry(componentType: string): A2uiRegistryEntry | null {
  return A2UI_REGISTRY[componentType] || null;
}
