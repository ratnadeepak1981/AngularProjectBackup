import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemSettingPanelCard } from '../../../../core/models/system/system-setting.model';

@Component({
  selector: 'app-control-panel-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-panel-card.component.html',
})
export class ControlPanelCardComponent {
  public readonly card = input.required<SystemSettingPanelCard>();
  public readonly cardClick = output<SystemSettingPanelCard>();

  public onClick(): void {
    this.cardClick.emit(this.card());
  }
}
