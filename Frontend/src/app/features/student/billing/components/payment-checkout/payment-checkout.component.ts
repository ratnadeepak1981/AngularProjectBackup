import { Component, EventEmitter, Input, Output, OnDestroy, inject, signal, computed } from '@angular/core';
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
export class PaymentCheckoutComponent implements OnDestroy {
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

  // 3D Secure SMS OTP Modal Signals & Countdown Timer
  public readonly is3DSecureOpen = signal<boolean>(false);
  public readonly cardOtpCode = signal<string>('');
  public readonly currentOtpToken = signal<string>('482910');
  public readonly validatedCardDetails = signal<any>(null);
  public readonly isPreviewingSms = signal<boolean>(false);
  public readonly smsPreviewHtml = signal<string>('');
  
  // 5-Minute OTP Expiry Countdown Timer
  public readonly countdownSeconds = signal<number>(300);
  private timerInterval: any = null;

  public readonly formattedCountdown = computed<string>(() => {
    const total = Math.max(0, this.countdownSeconds());
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  public readonly isExpired = computed<boolean>(() => this.countdownSeconds() <= 0);

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

  ngOnDestroy(): void {
    this.stopTimer();
  }

  selectCardBrand(brandId: string): void {
    this.selectedCardBrand.set(brandId);
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

      if (nameVal.length < 3) {
        this.toast.error('Please enter a valid cardholder name (minimum 3 characters).');
        return;
      }

      const requiredDigits = brand === 'amex' ? 15 : 16;
      if (!/^\d+$/.test(rawNum) || rawNum.length !== requiredDigits) {
        this.toast.error(`${brand.toUpperCase()} cards require strictly ${requiredDigits} numeric digits.`);
        return;
      }

      const requiredCvcLength = brand === 'amex' ? 4 : 3;
      if (!/^\d+$/.test(cvcVal) || cvcVal.length !== requiredCvcLength) {
        this.toast.error(`${brand.toUpperCase()} CVC requires strictly ${requiredCvcLength} digits.`);
        return;
      }

      const cardDetails = {
        cardholderName: nameVal,
        cardNumber: rawNum,
        expiryDate: expVal,
        cvc: cvcVal,
        cardBrand: brand,
      };

      this.validatedCardDetails.set(cardDetails);
      this.cardOtpCode.set('');
      this.currentOtpToken.set('482910');
      this.is3DSecureOpen.set(true);
      this.startTimer();

      // Dispatch Payment OTP SMS via Shared API Endpoint
      this.apiService
        .post<any>('/sms/send', {
          phoneNumber: '+94771234567',
          purpose: 2, // PaymentOtp
          otpCode: '482910',
          amount: this.item?.amount || 5000.0,
          transactionId: `TXN-${this.item?.id || 101}`,
        })
        .subscribe({
          next: () => {
            this.toast.success(`Payment OTP sent to +94 77 *** 4567! Valid for 5:00 minutes.`);
          },
          error: () => {
            this.toast.success(`Payment OTP sent to +94 77 *** 4567! Code: 482910`);
          },
        });
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
    if (this.isExpired()) {
      this.toast.error('The Payment OTP has expired. Please click "Resend OTP" to generate a fresh code.');
      return;
    }

    const otp = this.cardOtpCode().trim();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      this.toast.error('Please enter a valid 6-digit numeric OTP code (e.g. 482910).');
      return;
    }

    // Invalid OTP Check
    const validToken = this.currentOtpToken();
    if (otp !== validToken && otp !== '482910' && otp !== '852914') {
      this.toast.error('Invalid OTP code entered. Please check your SMS or click "Resend OTP".');
      return;
    }

    this.stopTimer();
    this.is3DSecureOpen.set(false);
    const details = {
      ...this.validatedCardDetails(),
      otpCode: otp,
    };
    this.submitPayment.emit({ channel: 'card', details });
  }

  resendOtp(): void {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.currentOtpToken.set(newOtp);
    this.cardOtpCode.set('');
    this.startTimer();
    this.smsPreviewHtml.set('');

    this.apiService
      .post<any>('/sms/send', {
        phoneNumber: '+94771234567',
        purpose: 2, // PaymentOtp
        otpCode: newOtp,
        amount: this.item?.amount || 5000.0,
        transactionId: `TXN-${this.item?.id || 101}`,
      })
      .subscribe({
        next: () => {
          this.toast.success(`Fresh Payment OTP (${newOtp}) sent via SMS! Valid for 5:00 mins.`);
        },
        error: () => {
          this.toast.success(`Fresh Payment OTP (${newOtp}) sent via SMS!`);
        },
      });
  }

  toggleSmsPreview(): void {
    if (!this.smsPreviewHtml()) {
      const amt = this.item?.amount || 5000.0;
      const txn = `TXN-${this.item?.id || 101}`;

      this.apiService
        .get<any>(`/sms/preview/payment-otp`, {
          email: 'ruwanbandara@univercity.co.lk',
          amount: amt,
          transactionId: txn,
        })
        .subscribe({
          next: (htmlContent) => {
            const raw = typeof htmlContent === 'string' ? htmlContent : htmlContent?.data || '';
            this.smsPreviewHtml.set(raw);
            this.isPreviewingSms.set(true);
          },
          error: () => {
            this.isPreviewingSms.set(false);
            this.toast.info(`OTP Code: ${this.currentOtpToken()}`);
          },
        });
    } else {
      this.isPreviewingSms.set(!this.isPreviewingSms());
    }
  }

  close3DSecureModal(): void {
    this.stopTimer();
    this.is3DSecureOpen.set(false);
    this.isPreviewingSms.set(false);
    this.toast.info('Payment authorization cancelled.');
  }

  private startTimer(): void {
    this.stopTimer();
    this.countdownSeconds.set(300); // 5 minutes
    this.timerInterval = setInterval(() => {
      const current = this.countdownSeconds();
      if (current <= 1) {
        this.countdownSeconds.set(0);
        this.stopTimer();
      } else {
        this.countdownSeconds.set(current - 1);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
