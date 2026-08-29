import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateRequestPageComponent } from './certificate-request-page.component';

describe('CertificateRequestPageComponent', () => {
  let component: CertificateRequestPageComponent;
  let fixture: ComponentFixture<CertificateRequestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateRequestPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateRequestPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
