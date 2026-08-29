import { TestBed } from '@angular/core/testing';

import { StudentComplaintService } from './student-complaint.service';

describe('StudentComplaintService', () => {
  let service: StudentComplaintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentComplaintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
