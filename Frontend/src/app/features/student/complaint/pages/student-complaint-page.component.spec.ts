import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentComplaintPageComponent } from './student-complaint-page.component';

describe('StudentComplaintPageComponent', () => {
  let component: StudentComplaintPageComponent;
  let fixture: ComponentFixture<StudentComplaintPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentComplaintPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentComplaintPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
