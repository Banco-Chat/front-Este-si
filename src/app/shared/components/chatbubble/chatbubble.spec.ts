import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chatbubble } from './chatbubble';

describe('Chatbubble', () => {
  let component: Chatbubble;
  let fixture: ComponentFixture<Chatbubble>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbubble],
    }).compileComponents();

    fixture = TestBed.createComponent(Chatbubble);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
