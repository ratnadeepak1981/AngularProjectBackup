import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeePaymentItem } from '../../services/student-billing.service';
import { ApiService } from '../../../../../core/services/api.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-checkout.component.html',
  styleUrl: './payment-checkout.component.css',
})
export class PaymentCheckoutComponent {
  private readonly toast = inject(ToastService);
  private readonly apiService = inject(ApiService);

  @Input() item: FeePaymentItem | null = null;
  @Input() isSubmitting = false;

  @Output() submitPayment = new EventEmitter<{ channel: string; details: any }>();
  @Output() cancelCheckout = new EventEmitter<void>();

  // Payment Channels: 'card' | 'lankapay' | 'slip'
  public readonly selectedChannel = signal<'card' | 'lankapay' | 'slip'>('card');

  // Card Channel Signals
  public readonly cardholderName = signal<string>('Kamal Perera');
  public readonly cardNumber = signal<string>('4532 9876 5432 8892');
  public readonly expiryDate = signal<string>('12/28');
  public readonly cvc = signal<string>('789');
  public readonly selectedCardBrand = signal<string>('visa');

  // 3D Secure SMS OTP Modal Signals
  public readonly is3DSecureOpen = signal<boolean>(false);
  public readonly cardOtpCode = signal<string>('');
  public readonly validatedCardDetails = signal<any>(null);
  public readonly isPreviewingSms = signal<boolean>(false);
  public readonly smsPreviewHtml = signal<string>('');

  // LankaPay Channel Signals
  public readonly selectedLankaBank = signal<string>('combank_digital');
  public readonly bankAccountHolder = signal<string>('');
  public readonly lankaRefNo = signal<string>('');

  // Comprehensive Sri Lankan Licensed Banks Array (LankaPay Network)
  public readonly lankaBanks = [
    { id: 'combank_digital', name: 'Commercial Bank of Ceylon - ComBank Digital' },
    { id: 'sampath_vishwa', name: 'Sampath Bank PLC - Sampath Vishwa' },
    { id: 'hnb_solo', name: 'Hatton National Bank PLC - HNB Solo / Online' },
    { id: 'boc_smartpay', name: 'Bank of Ceylon (BOC) - SmartPay Direct' },
    { id: 'peoples_wave', name: "People's Bank - People's Wave Online" },
    { id: 'nsb_direct', name: 'National Savings Bank (NSB) - NSB Direct' },
    { id: 'ntb_online', name: 'Nations Trust Bank (NTB) - NTB Online' },
    { id: 'seylan_simplypay', name: 'Seylan Bank PLC - Seylan SimplyPay' },
    { id: 'dfcc_virtual', name: 'DFCC Bank PLC - DFCC Virtual Wallet' },
    { id: 'ndb_neos', name: 'NDB Bank PLC - NDB NEOS Direct' },
    { id: 'pan_asia', name: 'Pan Asia Banking Corporation - Pan Asia Online' },
    { id: 'cargills_online', name: 'Cargills Bank Limited - Cargills Online' },
    { id: 'union_bank', name: 'Union Bank of Colombo PLC - Union Bank Online' },
    { id: 'sdb_online', name: 'SANASA Development Bank (SDB) - SDB Online' },
    { id: 'amana_bank', name: 'Amana Bank PLC - Amana Internet Banking' },
  ];

  // Deposit Slip Channel Signals
  public readonly slipFileName = signal<string>('');
  public readonly slipRefNo = signal<string>('');
  public readonly slipTransferDate = signal<string>('');

  // Real-World Payment Gateway Card Brands
  public readonly cardBrands = [
    { id: 'visa', name: 'Visa', icon: '💳', code: 'VISA' },
    { id: 'mastercard', name: 'Mastercard', icon: '🔴🟡', code: 'MC' },
    { id: 'amex', name: 'American Express', icon: '🌐', code: 'AMEX' },
    { id: 'unionpay', name: 'UnionPay', icon: '🟢🔴', code: 'UNIONPAY' },
    { id: 'discover', name: 'Discover / JCB', icon: '🟠', code: 'DISCOVER' },
  ];

  selectCardBrand(brandId: string): void {
    this.selectedCardBrand.set(brandId);
    // Auto-set standard demo card number format based on brand
    if (brandId === 'amex') {
      this.cardNumber.set('3782 822468 31005');
      this.cvc.set('4321');
    } else if (brandId === 'visa') {
      this.cardNumber.set('4532 9876 5432 8892');
      this.cvc.set('789');
    } else if (brandId === 'mastercard') {
      this.cardNumber.set('5412 7512 3412 3456');
      this.cvc.set('654');
    } else if (brandId === 'unionpay') {
      this.cardNumber.set('6221 2600 1234 5678');
      this.cvc.set('321');
    } else {
      this.cardNumber.set('6011 0009 1234 5678');
      this.cvc.set('987');
    }
  }

  onSlipFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.slipFileName.set(file.name);
    }
  }

  onSubmit(): void {
    const ch = this.selectedChannel();

    if (ch === 'card') {
      const brand = this.selectedCardBrand();
      const rawNum = this.cardNumber().replace(/\s+/g, '');
      const cvcVal = this.cvc().trim();
      const expVal = this.expiryDate().trim();
      const nameVal = this.cardholderName().trim();

      // 1. Cardholder Name Check
      if (nameVal.length < 3) {
        this.toast.error('Please enter a valid cardholder name (minimum 3 characters).');
        return;
      }

      // 2. Card digit length validation (Amex = 15 digits, Others = 16 digits)
      const requiredDigits = brand === 'amex' ? 15 : 16;
      if (!/^\d+$/.test(rawNum) || rawNum.length !== requiredDigits) {
        this.toast.error(
          `${brand.toUpperCase()} cards require strictly ${requiredDigits} numeric digits. (Entered ${rawNum.length} digits).`
        );
        return;
      }

      // 3. CVC length validation (Amex = 4 digits, Others = 3 digits)
      const requiredCvcLength = brand === 'amex' ? 4 : 3;
      if (!/^\d+$/.test(cvcVal) || cvcVal.length !== requiredCvcLength) {
        this.toast.error(
          `${brand.toUpperCase()} CVC security code requires strictly ${requiredCvcLength} digits. (Entered ${cvcVal.length} digits).`
        );
        return;
      }

      // 4. Expiry date format (MM/YY) & expiration check
      const expMatch = expVal.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      if (!expMatch) {
        this.toast.error('Please enter a valid expiry date format (MM/YY, e.g. 12/28).');
        return;
      }

      const expMonth = parseInt(expMatch[1], 10);
      const expYear = 2000 + parseInt(expMatch[2], 10);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        this.toast.error('The credit/debit card entered has passed its expiration date.');
        return;
      }

      const cardDetails = {
        cardholderName: nameVal,
        cardNumber: rawNum,
        expiryDate: expVal,
        cvc: cvcVal,
        cardBrand: brand,
      };

      // Store details & open 3D Secure SMS OTP modal with EMPTY input
      this.validatedCardDetails.set(cardDetails);
      this.cardOtpCode.set('');
      this.is3DSecureOpen.set(true);
      this.toast.success('3D Secure SMS OTP code sent to +94 77 *** 4567');
    } else if (ch === 'lankapay') {
      const details = {
        bankPortal: this.selectedLankaBank(),
        accountHolder: this.bankAccountHolder(),
        referenceNo: this.lankaRefNo(),
      };
      this.submitPayment.emit({ channel: ch, details });
    } else {
      const details = {
        fileName: this.slipFileName() || 'Bank_Deposit_Slip.pdf',
        referenceNo: this.slipRefNo(),
        transferDate: this.slipTransferDate(),
      };
      this.submitPayment.emit({ channel: ch, details });
    }
  }

  onAuthorize3DSecure(): void {
    const otp = this.cardOtpCode().trim();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      this.toast.error('Please enter the 6-digit numeric SMS OTP code (e.g. 852914).');
      return;
    }

    this.is3DSecureOpen.set(false);
    const details = {
      ...this.validatedCardDetails(),
      otpCode: otp,
    };
    this.submitPayment.emit({ channel: 'card', details });
  }

  toggleSmsPreview(): void {
    if (!this.smsPreviewHtml()) {
      this.apiService.get<any>(`/sms/preview/forgot-password`, { email: 'ruwanbandara@univercity.co.lk' }).subscribe({
        next: (htmlContent) => {
          const raw = typeof htmlContent === 'string' ? htmlContent : (htmlContent?.data || '');
          this.smsPreviewHtml.set(raw);
          this.isPreviewingSms.set(true);
        },
        error: () => {
          this.isPreviewingSms.set(false);
          this.toast.info('Demo OTP Code: 852914');
        },
      });
    } else {
      this.isPreviewingSms.set(!this.isPreviewingSms());
    }
  }

  close3DSecureModal(): void {
    this.is3DSecureOpen.set(false);
    this.isPreviewingSms.set(false);
  }
}
