/**
 * Loan amortization helpers.
 *
 * For interest-only loans the principal stays constant.
 * For principal & interest loans we use the standard amortization formula.
 */

export function monthlyPayment(principal, annualRate, termYears) {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/**
 * Returns array of yearly figures: { year, openingBalance, interestPaid, principalPaid, closingBalance }
 * for `years` years of a P&I loan.
 */
export function amortizationSchedule(principal, annualRate, termYears, years) {
  const schedule = [];
  if (principal <= 0 || termYears <= 0) return schedule;

  const r = annualRate / 12;
  const monthly = monthlyPayment(principal, annualRate, termYears);

  let balance = principal;
  for (let y = 1; y <= years; y++) {
    let interestThisYear = 0;
    let principalThisYear = 0;
    const opening = balance;
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principalPart = Math.min(monthly - interest, balance);
      interestThisYear += interest;
      principalThisYear += principalPart;
      balance = Math.max(0, balance - principalPart);
    }
    schedule.push({
      year: y,
      openingBalance: opening,
      interestPaid: interestThisYear,
      principalPaid: principalThisYear,
      closingBalance: balance,
      annualPayment: monthly * 12,
    });
  }
  return schedule;
}

/**
 * For interest-only loans — flat schedule.
 */
export function interestOnlySchedule(principal, annualRate, years) {
  const schedule = [];
  for (let y = 1; y <= years; y++) {
    const interest = principal * annualRate;
    schedule.push({
      year: y,
      openingBalance: principal,
      interestPaid: interest,
      principalPaid: 0,
      closingBalance: principal,
      annualPayment: interest,
    });
  }
  return schedule;
}
