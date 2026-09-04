export interface TableColumn<T = any> {
  key: string;
  header: string;
  label?: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'badge' | 'status' | 'date' | 'custom' | 'actions';
  align?: 'left' | 'center' | 'right';
  width?: string;
  badgeMap?: Record<string, { label: string; class: string }>;
  format?: (value: any, row: T) => string;
}
