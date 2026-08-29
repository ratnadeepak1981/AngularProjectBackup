import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignFeeModalComponent } from './assign-fee-modal.component';

describe('AssignFeeModalComponent', () => {
  let component: AssignFeeModalComponent;
  let fixture: ComponentFixture<AssignFeeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignFeeModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignFeeModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
