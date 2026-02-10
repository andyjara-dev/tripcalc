/**
 * Country code to flag emoji and name
 */

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

// Convert country code (ISO 3166-1 alpha-2) to flag emoji
export function getCountryFlag(countryCode: string): string {
  if (countryCode === 'LOCAL') return '🏠';
  if (!countryCode || countryCode.length !== 2) return '🌍';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

// Country codes to names (most common ones)
export const COUNTRY_NAMES: Record<string, string> = {
  'LOCAL': 'Local/Development',
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'PT': 'Portugal',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'IE': 'Ireland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'RO': 'Romania',
  'GR': 'Greece',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'JP': 'Japan',
  'CN': 'China',
  'KR': 'South Korea',
  'IN': 'India',
  'TH': 'Thailand',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'VN': 'Vietnam',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'TR': 'Turkey',
  'IL': 'Israel',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NZ': 'New Zealand',
};

export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode] || countryCode;
}

export function getCountryInfo(countryCode: string): CountryInfo {
  return {
    code: countryCode,
    name: getCountryName(countryCode),
    flag: getCountryFlag(countryCode),
  };
}
