import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentBillingPageComponent } from './student-billing-page.component';

describe('StudentBillingPageComponent', () => {
  let component: StudentBillingPageComponent;
  let fixture: ComponentFixture<StudentBillingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentBillingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentBillingPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
