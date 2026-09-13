import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetsPage } from './budgets';

describe('BudgetsPage', () => {
  let component: BudgetsPage;
  let fixture: ComponentFixture<BudgetsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
