import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumeItem } from './resume-item';

describe('ResumeItem', () => {
  let component: ResumeItem;
  let fixture: ComponentFixture<ResumeItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
