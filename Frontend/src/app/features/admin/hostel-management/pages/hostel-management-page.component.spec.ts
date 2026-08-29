import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostelManagementPageComponent } from './hostel-management-page.component';

describe('HostelManagementPageComponent', () => {
  let component: HostelManagementPageComponent;
  let fixture: ComponentFixture<HostelManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostelManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostelManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
