import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEventPageComponent } from './student-event-page.component';

describe('StudentEventPageComponent', () => {
  let component: StudentEventPageComponent;
  let fixture: ComponentFixture<StudentEventPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEventPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentEventPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
