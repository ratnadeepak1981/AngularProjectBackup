import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectDropdownComponent } from '../../select-dropdown/select-dropdown.component';
import { ALL_MAIN_COUNTRIES } from '../../../../core/constants/countries.constant';
import { DropdownOption } from '../../../../core/models/common/dropdown-option.model';

@Component({
  selector: 'app-address-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectDropdownComponent],
  template: `
    <div [formGroup]="addressForm" class="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>🏠</span>
            <span>Postal & Residential Address</span>
            <span class="text-rose-500 font-bold">*</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authoritative residence coordinates for official university correspondence & records.
          </p>
        </div>
        <span class="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 whitespace-nowrap">
          Permanent Residence
        </span>
      </div>

      <!-- Aligned 12-Column Responsive Grid -->
      <div class="grid grid-cols-12 gap-3.5 pt-1">
        <!-- Row 1: Street Address (8 cols) & Suite/Apartment (4 cols) -->
        <div class="col-span-12 sm:col-span-8 space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 h-5 flex items-center">
            Street Address / House No. <span class="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            formControlName="addressLine1"
            placeholder="e.g. No. 124, Temple Road"
            class="w-full h-10 px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
            [ngClass]="{
              'border-amber-400 dark:border-amber-500 focus:ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20':
                addressForm.get('addressLine1')?.touched && addressForm.get('addressLine1')?.invalid,
              'border-slate-300 dark:border-slate-700':
                !addressForm.get('addressLine1')?.touched || !addressForm.get('addressLine1')?.invalid
            }"
          />
          @if (addressForm.get('addressLine1')?.touched && addressForm.get('addressLine1')?.invalid) {
            <p class="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>Street address is required.</span>
            </p>
          }
        </div>

        <div class="col-span-12 sm:col-span-4 space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 h-5 flex items-center">
            Apt / Suite / Landmark <span class="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            formControlName="addressLine2"
            placeholder="e.g. Apt 4B, Level 2"
            class="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
          />
        </div>

        <!-- Row 2: City (4 cols), District/Province (4 cols), Postal Code (4 cols) -->
        <div class="col-span-12 sm:col-span-4 space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 h-5 flex items-center">
            City / Town <span class="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            formControlName="city"
            placeholder="e.g. Colombo"
            class="w-full h-10 px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
            [ngClass]="{
              'border-amber-400 dark:border-amber-500 focus:ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20':
                addressForm.get('city')?.touched && addressForm.get('city')?.invalid,
              'border-slate-300 dark:border-slate-700':
                !addressForm.get('city')?.touched || !addressForm.get('city')?.invalid
            }"
          />
          @if (addressForm.get('city')?.touched && addressForm.get('city')?.invalid) {
            <p class="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>City is required.</span>
            </p>
          }
        </div>

        <div class="col-span-12 sm:col-span-4 space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 h-5 flex items-center">
            District / Province <span class="text-rose-500 ml-0.5">*</span>
          </label>
          <select
            formControlName="districtOrProvince"
            class="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
          >
            <option value="Colombo">Colombo (Western)</option>
            <option value="Gampaha">Gampaha (Western)</option>
            <option value="Kalutara">Kalutara (Western)</option>
            <option value="Kandy">Kandy (Central)</option>
            <option value="Matale">Matale (Central)</option>
            <option value="Nuwara Eliya">Nuwara Eliya (Central)</option>
            <option value="Galle">Galle (Southern)</option>
            <option value="Matara">Matara (Southern)</option>
            <option value="Hambantota">Hambantota (Southern)</option>
            <option value="Kurunegala">Kurunegala (North Western)</option>
            <option value="Puttalam">Puttalam (North Western)</option>
            <option value="Jaffna">Jaffna (Northern)</option>
            <option value="Kilinochchi">Kilinochchi (Northern)</option>
            <option value="Anuradhapura">Anuradhapura (North Central)</option>
            <option value="Polonnaruwa">Polonnaruwa (North Central)</option>
            <option value="Badulla">Badulla (Uva)</option>
            <option value="Ratnapura">Ratnapura (Sabaragamuwa)</option>
            <option value="Kegalle">Kegalle (Sabaragamuwa)</option>
            <option value="Other">Other / International</option>
          </select>
        </div>

        <div class="col-span-12 sm:col-span-4 space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 h-5 flex items-center">
            Postal / ZIP Code
          </label>
          <input
            type="text"
            formControlName="postalCode"
            placeholder="e.g. 00700"
            class="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
          />
        </div>

        <!-- Row 3: Reusable Dropdown Component for Country (6 cols) & Address Verification Banner (6 cols) -->
        <div class="col-span-12 sm:col-span-6 space-y-1">
          <app-select-dropdown
            [label]="'Country'"
            [required]="true"
            [options]="countryOptions"
            [selectedValue]="selectedCountryValue"
            [placeholder]="'Select Country...'"
            [icon]="'🌐'"
            [searchable]="true"
            (selectionChange)="onCountryChange($event)"
          ></app-select-dropdown>
        </div>

        <div class="col-span-12 sm:col-span-6 space-y-1">
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 h-5 flex items-center">
            Residence Status
          </label>
          <div class="w-full h-10 px-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-2xs">
            <span class="text-base">📍</span>
            <span class="truncate font-medium">Official residence on record for student affairs</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddressEditorComponent {
  @Input({ required: true }) addressForm!: FormGroup;

  public readonly countryOptions: DropdownOption[] = ALL_MAIN_COUNTRIES;

  get selectedCountryValue(): string {
    return this.addressForm?.get('country')?.value || 'Sri Lanka';
  }

  onCountryChange(country: string): void {
    if (this.addressForm) {
      this.addressForm.get('country')?.setValue(country);
      this.addressForm.get('country')?.markAsDirty();
      this.addressForm.get('country')?.markAsTouched();
    }
  }
}

