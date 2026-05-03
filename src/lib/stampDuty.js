/**
 * Australian state stamp duty calculator — 2025-26 rates.
 *
 * Sources: each state revenue office (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
 * Rates current as of FY 2025-26. Verified against Revenue NSW, SRO Victoria,
 * Queensland Revenue Office, RevenueWA, RevenueSA, SRO Tasmania, ACT Revenue
 * Office, and Territory Revenue Office NT.
 *
 * IMPORTANT: These are STANDARD INVESTOR rates for residential property
 * (no first home buyer concessions, no foreign surcharge). SMSF purchases
 * via a Limited Recourse Borrowing Arrangement (LRBA) typically attract
 * the same rate as a standard investor purchase, but bare trust nominee
 * structures may have unique rules in some states. Always confirm with
 * a conveyancer.
 *
 * Brackets are applied marginally (i.e. only the portion of the property
 * value above each threshold is taxed at that bracket's rate), unless
 * otherwise noted (VIC has a flat-rate bracket between $960k-$2M).
 */

const STATES = {
  NSW: {
    name: "New South Wales",
    // Revenue NSW transfer duty rates 1 July 2025 - 30 June 2026
    // Source: revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty
    brackets: [
      { upTo: 17000, base: 0, rate: 0.0125 },
      { upTo: 36000, base: 213, rate: 0.015 },
      { upTo: 97000, base: 498, rate: 0.0175 },
      { upTo: 372000, base: 1566, rate: 0.035 },
      { upTo: 1240000, base: 11191, rate: 0.045 },
      { upTo: 3721000, base: 50251, rate: 0.055 },
      { upTo: Infinity, base: 186706, rate: 0.07 }, // Premium
    ],
    flatBrackets: [],
  },
  VIC: {
    name: "Victoria",
    // SRO Victoria general (non-PPR) rates
    // Note: $960k–$2M bracket is flat 5.5% on FULL value, not marginal
    brackets: [
      { upTo: 25000, base: 0, rate: 0.014 },
      { upTo: 130000, base: 350, rate: 0.024 },
      { upTo: 960000, base: 2870, rate: 0.06 },
      // 960k-2M flat handled separately
      { upTo: Infinity, base: 110000, rate: 0.065 }, // above $2M: $110k + 6.5% on excess
    ],
    flatBrackets: [
      // VIC: between $960,001 and $2,000,000 a flat 5.5% applies to entire value
      { from: 960001, to: 2000000, flatRate: 0.055 },
    ],
  },
  QLD: {
    name: "Queensland",
    // QRO investor rates (no home concession)
    brackets: [
      { upTo: 5000, base: 0, rate: 0 },
      { upTo: 75000, base: 0, rate: 0.015 },
      { upTo: 540000, base: 1050, rate: 0.035 },
      { upTo: 1000000, base: 17325, rate: 0.045 },
      { upTo: Infinity, base: 38025, rate: 0.0575 },
    ],
    flatBrackets: [],
  },
  WA: {
    name: "Western Australia",
    // RevenueWA general rates
    brackets: [
      { upTo: 120000, base: 0, rate: 0.019 },
      { upTo: 150000, base: 2280, rate: 0.0285 },
      { upTo: 360000, base: 3135, rate: 0.038 },
      { upTo: 725000, base: 11115, rate: 0.0475 },
      { upTo: Infinity, base: 28453, rate: 0.0515 },
    ],
    flatBrackets: [],
  },
  SA: {
    name: "South Australia",
    // RevenueSA general rates
    brackets: [
      { upTo: 12000, base: 0, rate: 0.01 },
      { upTo: 30000, base: 120, rate: 0.02 },
      { upTo: 50000, base: 480, rate: 0.03 },
      { upTo: 100000, base: 1080, rate: 0.035 },
      { upTo: 200000, base: 2830, rate: 0.04 },
      { upTo: 250000, base: 6830, rate: 0.0425 },
      { upTo: 300000, base: 8955, rate: 0.0475 },
      { upTo: 500000, base: 11330, rate: 0.05 },
      { upTo: Infinity, base: 21330, rate: 0.055 },
    ],
    flatBrackets: [],
  },
  TAS: {
    name: "Tasmania",
    // SRO Tasmania general rates
    brackets: [
      { upTo: 3000, base: 50, rate: 0 },
      { upTo: 25000, base: 50, rate: 0.0175 },
      { upTo: 75000, base: 435, rate: 0.0225 },
      { upTo: 200000, base: 1560, rate: 0.035 },
      { upTo: 375000, base: 5935, rate: 0.04 },
      { upTo: 725000, base: 12935, rate: 0.0425 },
      { upTo: Infinity, base: 27810, rate: 0.045 },
    ],
    flatBrackets: [],
  },
  ACT: {
    name: "Australian Capital Territory",
    // ACT Revenue Office — investor rates (commercial / residential investment)
    brackets: [
      { upTo: 260000, base: 0, rate: 0.0149 },
      { upTo: 300000, base: 3874, rate: 0.0319 },
      { upTo: 500000, base: 5150, rate: 0.0419 },
      { upTo: 750000, base: 13530, rate: 0.0494 },
      { upTo: 1000000, base: 25880, rate: 0.0589 },
      { upTo: 1455000, base: 40605, rate: 0.0639 },
      { upTo: Infinity, base: 0, rate: 0.0454, flatOnTotal: true }, // 4.54% flat on total above $1.455M
    ],
    flatBrackets: [],
  },
  NT: {
    name: "Northern Territory",
    // NT Territory Revenue Office — uses formula: D = (0.06571441 × V²) + 15V (where V = price/$1000) up to $525k
    // Above $525k: 4.95% flat on entire value. Above $3M: 5.95%.
    formula: true,
  },
};

export function calculateStampDuty(state, price) {
  if (!price || price <= 0) return 0;
  const cfg = STATES[state];
  if (!cfg) return 0;

  // NT uses a formula
  if (cfg.formula) {
    if (price <= 525000) {
      const V = price / 1000;
      return Math.round(0.06571441 * V * V + 15 * V);
    } else if (price <= 3000000) {
      return Math.round(price * 0.0495);
    } else {
      return Math.round(price * 0.0595);
    }
  }

  // Check VIC flat-rate bracket first
  if (cfg.flatBrackets) {
    for (const fb of cfg.flatBrackets) {
      if (price >= fb.from && price <= fb.to) {
        return Math.round(price * fb.flatRate);
      }
    }
  }

  // Marginal-rate brackets
  for (const b of cfg.brackets) {
    if (price <= b.upTo) {
      // Find the previous bracket's upper threshold
      const prev = cfg.brackets[cfg.brackets.indexOf(b) - 1];
      const lower = prev ? prev.upTo : 0;

      if (b.flatOnTotal) {
        return Math.round(price * b.rate);
      }
      return Math.round(b.base + (price - lower) * b.rate);
    }
  }

  // Fallback (shouldn't reach)
  const last = cfg.brackets[cfg.brackets.length - 1];
  const prev = cfg.brackets[cfg.brackets.length - 2];
  const lower = prev ? prev.upTo : 0;
  return Math.round(last.base + (price - lower) * last.rate);
}

export const STATE_OPTIONS = [
  { code: "NSW", label: "New South Wales" },
  { code: "VIC", label: "Victoria" },
  { code: "QLD", label: "Queensland" },
  { code: "WA", label: "Western Australia" },
  { code: "SA", label: "South Australia" },
  { code: "TAS", label: "Tasmania" },
  { code: "ACT", label: "ACT" },
  { code: "NT", label: "Northern Territory" },
];
