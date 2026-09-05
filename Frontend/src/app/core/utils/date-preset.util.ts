import { DropdownOption } from '../models/common/dropdown-option.model';

export interface DateRangeResult {
  fromDate: string; // Format: YYYY-MM-DD
  toDate: string;   // Format: YYYY-MM-DD
}

/**
 * Reusable utility for calculating standard administrative, financial, and reporting date ranges.
 */
export class DatePresetUtil {
  /**
   * Helper to format a Date instance into YYYY-MM-DD string.
   */
  public static formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Returns a list of standardized date preset options suitable for dropdown menus in reports & audit trails.
   */
  public static getPresetOptions(): DropdownOption[] {
    const now = new Date();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    // Academic year calculation (e.g. 2025/2026 or 2026/2027)
    const acadStartYear = now.getMonth() >= 6 ? currentYear : lastYear;
    const acadEndYear = acadStartYear + 1;

    return [
      { label: 'All Time (No Limit)', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'This Week (Mon - Sun)', value: 'thisWeek' },
      { label: 'Last Week', value: 'lastWeek' },
      { label: 'Last 7 Days', value: 'last7days' },
      { label: 'Last 14 Days', value: 'last14days' },
      { label: 'Last 30 Days', value: 'last30days' },
      { label: 'Last 90 Days', value: 'last90days' },
      { label: 'This Month', value: 'thisMonth' },
      { label: 'Last Month', value: 'lastMonth' },
      { label: `This Quarter (Q${currentQuarter})`, value: 'thisQuarter' },
      { label: 'Last Quarter', value: 'lastQuarter' },
      { label: 'Year to Date (YTD)', value: 'ytd' },
      { label: `This Year (${currentYear})`, value: 'thisYear' },
      { label: `Last Year (${lastYear})`, value: 'lastYear' },
      { label: `Academic Year (${acadStartYear}/${acadEndYear})`, value: 'academicYear' },
      { label: 'Custom Date Range', value: 'custom' },
    ];
  }

  /**
   * Computes the { fromDate, toDate } YYYY-MM-DD boundaries for any selected preset.
   */
  public static calculateDateRange(preset: string): DateRangeResult {
    const now = new Date();

    let fromStr = '';
    let toStr = '';

    switch (preset) {
      case 'today': {
        fromStr = this.formatDate(now);
        toStr = this.formatDate(now);
        break;
      }
      case 'yesterday': {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        fromStr = this.formatDate(yest);
        toStr = this.formatDate(yest);
        break;
      }
      case 'thisWeek': {
        const d = new Date(now);
        const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        fromStr = this.formatDate(monday);
        toStr = this.formatDate(sunday);
        break;
      }
      case 'lastWeek': {
        const d = new Date(now);
        const dayOfWeek = d.getDay();
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) - 7;
        const lastMonday = new Date(d);
        lastMonday.setDate(d.getDate() + diffToMonday);

        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);

        fromStr = this.formatDate(lastMonday);
        toStr = this.formatDate(lastSunday);
        break;
      }
      case 'last7days': {
        const past = new Date(now);
        past.setDate(past.getDate() - 7);
        fromStr = this.formatDate(past);
        toStr = this.formatDate(now);
        break;
      }
      case 'last14days': {
        const past = new Date(now);
        past.setDate(past.getDate() - 14);
        fromStr = this.formatDate(past);
        toStr = this.formatDate(now);
        break;
      }
      case 'last30days': {
        const past = new Date(now);
        past.setDate(past.getDate() - 30);
        fromStr = this.formatDate(past);
        toStr = this.formatDate(now);
        break;
      }
      case 'last90days': {
        const past = new Date(now);
        past.setDate(past.getDate() - 90);
        fromStr = this.formatDate(past);
        toStr = this.formatDate(now);
        break;
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        fromStr = this.formatDate(firstDay);
        toStr = this.formatDate(lastDay);
        break;
      }
      case 'lastMonth': {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        fromStr = this.formatDate(firstDayLastMonth);
        toStr = this.formatDate(lastDayLastMonth);
        break;
      }
      case 'thisQuarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const firstDay = new Date(now.getFullYear(), currentQuarter * 3, 1);
        const lastDay = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        fromStr = this.formatDate(firstDay);
        toStr = this.formatDate(lastDay);
        break;
      }
      case 'lastQuarter': {
        let qYear = now.getFullYear();
        let lastQIndex = Math.floor(now.getMonth() / 3) - 1;
        if (lastQIndex < 0) {
          lastQIndex = 3;
          qYear -= 1;
        }
        const firstDay = new Date(qYear, lastQIndex * 3, 1);
        const lastDay = new Date(qYear, (lastQIndex + 1) * 3, 0);
        fromStr = this.formatDate(firstDay);
        toStr = this.formatDate(lastDay);
        break;
      }
      case 'ytd': {
        fromStr = `${now.getFullYear()}-01-01`;
        toStr = this.formatDate(now);
        break;
      }
      case 'thisYear': {
        fromStr = `${now.getFullYear()}-01-01`;
        toStr = `${now.getFullYear()}-12-31`;
        break;
      }
      case 'lastYear': {
        const prevYear = now.getFullYear() - 1;
        fromStr = `${prevYear}-01-01`;
        toStr = `${prevYear}-12-31`;
        break;
      }
      case 'academicYear': {
        // Academic year spans July 1st to June 30th
        const acadStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
        const acadEndYear = acadStartYear + 1;
        fromStr = `${acadStartYear}-07-01`;
        toStr = `${acadEndYear}-06-30`;
        break;
      }
      case 'all':
      default: {
        fromStr = '';
        toStr = '';
        break;
      }
    }

    return { fromDate: fromStr, toDate: toStr };
  }
}
