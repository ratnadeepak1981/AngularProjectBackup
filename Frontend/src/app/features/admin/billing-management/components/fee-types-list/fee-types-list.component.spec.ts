import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeTypesListComponent } from './fee-types-list.component';

describe('FeeTypesListComponent', () => {
  let component: FeeTypesListComponent;
  let fixture: ComponentFixture<FeeTypesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeTypesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeTypesListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
