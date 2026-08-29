import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeAssignmentsListComponent } from './fee-assignments-list.component';

describe('FeeAssignmentsListComponent', () => {
  let component: FeeAssignmentsListComponent;
  let fixture: ComponentFixture<FeeAssignmentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeAssignmentsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeAssignmentsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
