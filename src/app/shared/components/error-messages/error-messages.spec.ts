import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessages } from './error-messages';

describe('ErrorMessages', () => {
  let component: ErrorMessages;
  let fixture: ComponentFixture<ErrorMessages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorMessages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
