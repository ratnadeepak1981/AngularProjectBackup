export interface SystemSettingItem {
  settingKey: string;
  settingValue: string;
  category:
    | 'organization'
    | 'finance'
    | 'student'
    | 'hostel'
    | 'laboratory'
    | 'events'
    | 'security'
    | 'notifications'
    | 'application';
  description?: string;
}

export interface SystemSettingPanelCard {
  id: string;
  title: string;
  icon: string;
  colorTheme: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'indigo' | 'slate';
  description: string;
  summaryItems: string[];
  settingsCount: number;
}
