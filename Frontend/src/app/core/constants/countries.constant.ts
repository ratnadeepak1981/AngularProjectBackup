import { DropdownOption } from '../models/common/dropdown-option.model';

export const ALL_MAIN_COUNTRIES: DropdownOption[] = [
  // 1. South Asia & Domestic Priority
  { value: 'Sri Lanka', label: 'Sri Lanka', icon: '🇱🇰', description: 'Domestic / Home Country (Default)' },
  { value: 'India', label: 'India', icon: '🇮🇳', description: 'South Asia' },
  { value: 'Maldives', label: 'Maldives', icon: '🇲🇻', description: 'South Asia' },
  { value: 'Pakistan', label: 'Pakistan', icon: '🇵🇰', description: 'South Asia' },
  { value: 'Bangladesh', label: 'Bangladesh', icon: '🇧🇩', description: 'South Asia' },
  { value: 'Nepal', label: 'Nepal', icon: '🇳🇵', description: 'South Asia' },
  { value: 'Bhutan', label: 'Bhutan', icon: '🇧🇹', description: 'South Asia' },

  // 2. Asia-Pacific & East Asia
  { value: 'Australia', label: 'Australia', icon: '🇦🇺', description: 'Oceania' },
  { value: 'New Zealand', label: 'New Zealand', icon: '🇳🇿', description: 'Oceania' },
  { value: 'Singapore', label: 'Singapore', icon: '🇸🇬', description: 'Southeast Asia' },
  { value: 'Malaysia', label: 'Malaysia', icon: '🇲🇾', description: 'Southeast Asia' },
  { value: 'Japan', label: 'Japan', icon: '🇯🇵', description: 'East Asia' },
  { value: 'South Korea', label: 'South Korea', icon: '🇰🇷', description: 'East Asia' },
  { value: 'China', label: 'China', icon: '🇨🇳', description: 'East Asia' },
  { value: 'Hong Kong', label: 'Hong Kong', icon: '🇭🇰', description: 'East Asia' },
  { value: 'Thailand', label: 'Thailand', icon: '🇹🇭', description: 'Southeast Asia' },
  { value: 'Indonesia', label: 'Indonesia', icon: '🇮🇩', description: 'Southeast Asia' },
  { value: 'Vietnam', label: 'Vietnam', icon: '🇻🇳', description: 'Southeast Asia' },
  { value: 'Philippines', label: 'Philippines', icon: '🇵🇭', description: 'Southeast Asia' },

  // 3. Middle East & Gulf
  { value: 'United Arab Emirates', label: 'United Arab Emirates', icon: '🇦🇪', description: 'Middle East' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', icon: '🇸🇦', description: 'Middle East' },
  { value: 'Qatar', label: 'Qatar', icon: '🇶🇦', description: 'Middle East' },
  { value: 'Oman', label: 'Oman', icon: '🇴🇲', description: 'Middle East' },
  { value: 'Kuwait', label: 'Kuwait', icon: '🇰🇼', description: 'Middle East' },
  { value: 'Bahrain', label: 'Bahrain', icon: '🇧🇭', description: 'Middle East' },

  // 4. Europe & United Kingdom
  { value: 'United Kingdom', label: 'United Kingdom', icon: '🇬🇧', description: 'Europe' },
  { value: 'Germany', label: 'Germany', icon: '🇩🇪', description: 'Europe' },
  { value: 'France', label: 'France', icon: '🇫🇷', description: 'Europe' },
  { value: 'Italy', label: 'Italy', icon: '🇮🇹', description: 'Europe' },
  { value: 'Netherlands', label: 'Netherlands', icon: '🇳🇱', description: 'Europe' },
  { value: 'Switzerland', label: 'Switzerland', icon: '🇨🇭', description: 'Europe' },
  { value: 'Sweden', label: 'Sweden', icon: '🇸🇪', description: 'Europe' },
  { value: 'Norway', label: 'Norway', icon: '🇳🇴', description: 'Europe' },
  { value: 'Ireland', label: 'Ireland', icon: '🇮🇪', description: 'Europe' },
  { value: 'Finland', label: 'Finland', icon: '🇫🇮', description: 'Europe' },
  { value: 'Denmark', label: 'Denmark', icon: '🇩🇰', description: 'Europe' },
  { value: 'Spain', label: 'Spain', icon: '🇪🇸', description: 'Europe' },
  { value: 'Belgium', label: 'Belgium', icon: '🇧🇪', description: 'Europe' },
  { value: 'Austria', label: 'Austria', icon: '🇦🇹', description: 'Europe' },

  // 5. North & South America
  { value: 'United States', label: 'United States', icon: '🇺🇸', description: 'North America' },
  { value: 'Canada', label: 'Canada', icon: '🇨🇦', description: 'North America' },
  { value: 'Brazil', label: 'Brazil', icon: '🇧🇷', description: 'South America' },
  { value: 'Mexico', label: 'Mexico', icon: '🇲🇽', description: 'North America' },
  { value: 'Argentina', label: 'Argentina', icon: '🇦🇷', description: 'South America' },

  // 6. Africa & International
  { value: 'South Africa', label: 'South Africa', icon: '🇿🇦', description: 'Africa' },
  { value: 'Kenya', label: 'Kenya', icon: '🇰🇪', description: 'Africa' },
  { value: 'Nigeria', label: 'Nigeria', icon: '🇳🇬', description: 'Africa' },
  { value: 'Egypt', label: 'Egypt', icon: '🇪🇬', description: 'Africa / Middle East' },
  { value: 'Other', label: 'Other International', icon: '🌐', description: 'Other Global Territories' },
];
