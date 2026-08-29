import { TestBed } from '@angular/core/testing';

import { HostelApplicationService } from './hostel-application.service';

describe('HostelApplicationService', () => {
  let service: HostelApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostelApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
