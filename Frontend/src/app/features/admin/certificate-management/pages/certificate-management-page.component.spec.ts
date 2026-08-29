import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateManagementPageComponent } from './certificate-management-page.component';

describe('CertificateManagementPageComponent', () => {
  let component: CertificateManagementPageComponent;
  let fixture: ComponentFixture<CertificateManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
