export interface FilterOption {
    value: string | number;
    label: string;
}

export const accountTypeOpt: FilterOption[] = [
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'SAVINGS', label: 'Ahorro' },
  { value: 'CASH', label: 'Efectivo' },
];