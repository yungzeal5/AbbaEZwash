const DEFAULT_LOCALE = "en-GH";
const DEFAULT_CURRENCY = "GHS";

interface FormatMoneyOptions {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

export function formatMoney(
  amount: number,
  options: FormatMoneyOptions = {},
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}
