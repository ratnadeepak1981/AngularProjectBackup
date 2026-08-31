import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  public readonly label = input<string>('Select Date');
  public readonly selectedDate = input<string>('');
  public readonly minDate = input<string>(new Date().toISOString().split('T')[0]);
  public readonly disabled = input<boolean>(false);

  public readonly dateChange = output<string>();

  public onDateInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val && this.minDate() && val < this.minDate()) {
      (event.target as HTMLInputElement).value = this.minDate();
      this.dateChange.emit(this.minDate());
      return;
    }
    this.dateChange.emit(val);
  }
}
