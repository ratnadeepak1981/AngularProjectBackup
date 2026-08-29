import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyManagementPageComponent } from './faculty-management.page.component';

describe('FacultyManagementPageComponent', () => {
  let component: FacultyManagementPageComponent;
  let fixture: ComponentFixture<FacultyManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FacultyManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
