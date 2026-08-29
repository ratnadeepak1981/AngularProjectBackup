import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabManagementPageComponent } from './lab-management-page.component';

describe('LabManagementPageComponent', () => {
  let component: LabManagementPageComponent;
  let fixture: ComponentFixture<LabManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
