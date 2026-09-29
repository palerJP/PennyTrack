export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
  decimals: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso (PHP)',
    position: 'prefix',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    position: 'prefix',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    position: 'prefix',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    position: 'prefix',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen (JPY)',
    position: 'prefix',
    decimals: 0,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CAD)',
    position: 'prefix',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar (AUD)',
    position: 'prefix',
    decimals: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar (SGD)',
    position: 'prefix',
    decimals: 2,
  },
};

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = 'PHP',
  includeSymbol: boolean = true
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  const config = CURRENCIES[currencyCode] || CURRENCIES.PHP;
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  const sign = amount < 0 ? '-' : '';

  if (!includeSymbol) {
    return `${sign}${formattedNumber}`;
  }

  if (config.position === 'prefix') {
    return `${sign}${config.symbol}${formattedNumber}`;
  } else {
    return `${sign}${formattedNumber} ${config.symbol}`;
  }
}
