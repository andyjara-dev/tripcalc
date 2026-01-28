export interface TransportPrices {
  metro?: {
    singleTicket: number;
    dayPass?: number;
    multiTicket?: {
      rides: number;
      price: number;
    };
  };
  bus?: {
    singleTicket: number;
    dayPass?: number;
  };
  taxi?: {
    baseRate: number;
    perKm: number;
    perMinute?: number;
  };
  uber?: {
    available: boolean;
    averageAirportToCity?: number;
  };
  train?: {
    airportToCity?: number;
  };
}

export interface DailyCostEstimate {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
}

export interface DailyCosts {
  budget: DailyCostEstimate;
  midRange: DailyCostEstimate;
  luxury: DailyCostEstimate;
}

export interface TipsInfo {
  restaurants: string;
  cafes: string;
  taxis: string;
  general: string;
}

export interface CashInfo {
  widelyAccepted: boolean;
  atmAvailability: string;
  atmFees?: string;
  recommendedAmount: string;
}

export interface HiddenCost {
  type: 'tax' | 'fee' | 'surcharge' | 'warning';
  title: string;
  description: string;
  amount?: string;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  currency: string;
  currencySymbol: string;
  language: string;
  transport: TransportPrices;
  dailyCosts: DailyCosts;
  tips: TipsInfo;
  cash: CashInfo;
  hiddenCosts?: HiddenCost[];
  lastUpdated: string;
}
