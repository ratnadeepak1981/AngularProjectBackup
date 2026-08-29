import { TestBed } from '@angular/core/testing';

import { NotificationMonitorService } from './notification-monitor.service';

describe('NotificationMonitorService', () => {
  let service: NotificationMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
