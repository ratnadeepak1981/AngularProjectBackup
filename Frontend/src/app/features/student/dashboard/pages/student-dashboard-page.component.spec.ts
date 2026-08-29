import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDashboardPageComponent } from './student-dashboard-page.component';

describe('StudentDashboardPageComponent', () => {
  let component: StudentDashboardPageComponent;
  let fixture: ComponentFixture<StudentDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDashboardPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
