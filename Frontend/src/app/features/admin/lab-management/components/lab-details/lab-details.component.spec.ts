import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabDetailsComponent } from './lab-details.component';

describe('LabDetailsComponent', () => {
  let component: LabDetailsComponent;
  let fixture: ComponentFixture<LabDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
