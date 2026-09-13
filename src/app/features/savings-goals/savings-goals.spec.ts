import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavingsGoalsPage } from './savings-goals';

describe('SavingsGoalsPage', () => {
  let component: SavingsGoalsPage;
  let fixture: ComponentFixture<SavingsGoalsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingsGoalsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsGoalsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
