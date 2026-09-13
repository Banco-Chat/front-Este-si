import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankTransactionItem } from './bank-transaction-item';

describe('BankTransactionItem', () => {
  let component: BankTransactionItem;
  let fixture: ComponentFixture<BankTransactionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankTransactionItem],
    }).compileComponents();

    fixture = TestBed.createComponent(BankTransactionItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
