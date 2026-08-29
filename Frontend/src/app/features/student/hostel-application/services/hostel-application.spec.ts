import { TestBed } from '@angular/core/testing';

import { HostelApplication } from './hostel-application';

describe('HostelApplication', () => {
  let service: HostelApplication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostelApplication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
