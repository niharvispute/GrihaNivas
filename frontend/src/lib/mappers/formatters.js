// Compact display formatter: 5,60,00,000 → "5.6 Cr", 85,00,000 → "85 Lac", 50,000 → "50 K"
export const formatPriceShort = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return '0';
  const trim = (n, d) => parseFloat(n.toFixed(d)).toString();
  if (amount >= 10000000) return `${trim(amount / 10000000, 2)} Cr`;
  if (amount >= 100000) return `${trim(amount / 100000, 2)} Lac`;
  if (amount >= 1000) return `${trim(amount / 1000, 1)} K`;
  return String(Math.round(amount));
};

export const formatCurrencyINR = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateLabel = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const titleCase = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
};

export const estimateReadTime = (text) => {
  if (!text) return '1 min read';
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
};
