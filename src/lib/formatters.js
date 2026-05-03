export const fmtCurrency = (v, decimals = 0) => {
  const num = Number.isFinite(+v) ? +v : 0;
  return (
    (num < 0 ? "-$" : "$") +
    Math.abs(num).toLocaleString("en-AU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
};

export const fmtCurrencyShort = (v) => {
  const num = Number.isFinite(+v) ? +v : 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-$" : "$";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + "k";
  return sign + abs.toFixed(0);
};

export const fmtPct = (v, decimals = 2) => {
  const num = Number.isFinite(+v) ? +v : 0;
  return (
    (num * 100).toLocaleString("en-AU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + "%"
  );
};
