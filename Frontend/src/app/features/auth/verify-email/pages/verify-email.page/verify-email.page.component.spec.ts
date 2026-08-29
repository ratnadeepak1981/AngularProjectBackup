import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailPageComponent } from './verify-email.page.component';

describe('VerifyEmailPageComponent', () => {
  let component: VerifyEmailPageComponent;
  let fixture: ComponentFixture<VerifyEmailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
