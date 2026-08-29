import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-tab-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css',
})
export class TabComponent {
  tabs = input<TabItem[]>([]);
  activeTabId = input<string>('');
  variant = input<'3d' | 'underline' | 'segmented'>('3d');

  tabChange = output<string>();

  onTabClick(id: string): void {
    const targetTab = this.tabs().find((t) => t.id === id);
    if (targetTab && !targetTab.disabled && this.activeTabId() !== id) {
      this.tabChange.emit(id);
    }
  }
}
