import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPaymentPageComponent } from './student-payment-page.component';

describe('StudentPaymentPageComponent', () => {
  let component: StudentPaymentPageComponent;
  let fixture: ComponentFixture<StudentPaymentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPaymentPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentPaymentPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
