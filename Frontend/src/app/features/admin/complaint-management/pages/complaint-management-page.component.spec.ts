import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintManagementPageComponent } from './complaint-management-page.component';

describe('ComplaintManagementPageComponent', () => {
  let component: ComplaintManagementPageComponent;
  let fixture: ComponentFixture<ComplaintManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
