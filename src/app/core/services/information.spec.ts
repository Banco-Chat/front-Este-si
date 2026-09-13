import { TestBed } from '@angular/core/testing';
import { Information } from './information';

describe('Information', () => {
  let service: Information;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Information);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
