import { calculateStampDuty } from "./stampDuty";
import {
  amortizationSchedule,
  interestOnlySchedule,
  monthlyPayment,
} from "./loanAmortization";

const n = (v) => (Number.isFinite(+v) ? +v : 0);

/**
 * The main calculator. Takes an `inputs` object and returns all derived
 * values needed by the UI (KPIs, projections, charts).
 *
 * Match against the original Excel:
 *   - Year-1 cash flow numbers reproduce the spreadsheet to the cent
 *     when given the same inputs.
 * Improvements:
 *   - Auto stamp duty per state
 *   - P&I loan option with proper amortization
 *   - Year-by-year projection with rent growth + expense inflation
 *   - Compounding capital growth (annual rate, not total)
 *   - Annualised ROI
 */
export function calculate(i) {
  // ---- Stamp duty (auto or manual override) ----
  const stampDuty = i.autoStampDuty
    ? calculateStampDuty(i.state, n(i.propertyPrice))
    : n(i.stampDutyOverride);

  // ---- Property costs ----
  const totalPropertyCosts =
    n(i.propertyPrice) +
    n(i.solicitorsFee) +
    stampDuty +
    n(i.landTransferFee) +
    n(i.preInspections) +
    n(i.smsfEstablishment) +
    n(i.otherPropCost1) +
    n(i.otherPropCost2);

  // ---- Borrowing expenses ----
  const totalBorrowingExp =
    n(i.mortRegFee) +
    n(i.lmi) +
    n(i.valuationFee) +
    n(i.loanEstFees) +
    n(i.titleSearchFees) +
    n(i.otherBorrow1) +
    n(i.otherBorrow2);

  // ---- Funds & loan ----
  const totalFundsRequired =
    totalPropertyCosts + n(i.initialRepairs) + totalBorrowingExp;

  // Deposit calculated from percentage of property price
  const deposit = n(i.propertyPrice) * (n(i.depositPercentage) / 100);
  const acquisitionCosts = totalFundsRequired - n(i.propertyPrice); // costs above the price
  const initialCashOutlay = deposit + acquisitionCosts;
  const loanAmount = Math.max(0, n(i.propertyPrice) - deposit);
  const lvr = n(i.propertyPrice) > 0 ? loanAmount / n(i.propertyPrice) : 0;

  // ---- Build loan schedule ----
  const isPI = i.loanType === "PrincipalAndInterest";
  const loanSchedule = isPI
    ? amortizationSchedule(
        loanAmount,
        n(i.interestRate) / 100,
        n(i.loanTermYears),
        n(i.holdingYears),
      )
    : interestOnlySchedule(loanAmount, n(i.interestRate) / 100, n(i.holdingYears));

  const monthlyLoanPayment = isPI
    ? monthlyPayment(loanAmount, n(i.interestRate) / 100, n(i.loanTermYears))
    : (loanAmount * (n(i.interestRate) / 100)) / 12;

  // ---- Year 1 outgoings ----
  const operatingExpenses =
    n(i.advertising) +
    n(i.bodyCorporate) +
    n(i.cleaning) +
    n(i.councilRates) +
    n(i.gardening) +
    n(i.insurance) +
    n(i.landTax) +
    n(i.legalExpenses) +
    n(i.pestControl) +
    n(i.propertyAgentFees) +
    n(i.repairs) +
    n(i.stationery) +
    n(i.travel) +
    n(i.water) +
    n(i.smsfDeductible) +
    n(i.sundry);

  const y1 = loanSchedule[0] || {
    interestPaid: 0,
    principalPaid: 0,
    annualPayment: 0,
  };
  const interestOnLoan = y1.interestPaid;
  const principalRepaid = y1.principalPaid;
  const annualLoanPayment = y1.annualPayment;

  const totalOutgoings = operatingExpenses + interestOnLoan;
  const totalCashOutgoings = operatingExpenses + annualLoanPayment; // includes principal for P&I
  const weeklyOutgoings = totalCashOutgoings / 52;

  // ---- Income ----
  const annualRental = n(i.weeklyRental) * n(i.rentedWeeks);
  const grossRent = annualRental + n(i.otherRentalIncome);
  const grossRentalYield =
    n(i.propertyPrice) > 0 ? annualRental / n(i.propertyPrice) : 0;
  const netRentalYield =
    n(i.propertyPrice) > 0
      ? (annualRental - operatingExpenses) / n(i.propertyPrice)
      : 0;
  const netYieldAfterInterest =
    n(i.propertyPrice) > 0
      ? (annualRental - totalOutgoings) / n(i.propertyPrice)
      : 0;

  // ---- Tax (Year 1) ----
  const borrowingExpDeduction = totalBorrowingExp / 5; // ATO: amortise over 5 yrs
  const preTaxCashFlow = grossRent - totalOutgoings;
  const taxableIncome =
    preTaxCashFlow -
    borrowingExpDeduction -
    n(i.declineInValue) -
    n(i.capitalWorks);
  const annualTaxSavings =
    taxableIncome < 0 ? Math.abs(taxableIncome) * (n(i.taxRate) / 100) : 0;
  const annualTaxOwed =
    taxableIncome > 0 ? taxableIncome * (n(i.taxRate) / 100) : 0;

  // After-tax cash flow uses real cash outgoings (incl. principal for P&I)
  const preTaxRealCashFlow = grossRent - totalCashOutgoings;
  const afterTaxCashFlow = preTaxRealCashFlow + annualTaxSavings - annualTaxOwed;
  const weeklyRentalIncome = annualRental / 52;
  const weeklyTaxSavings = annualTaxSavings / 52;
  const weeklyAfterTax = afterTaxCashFlow / 52;

  // ---- Who pays the outgoings ----
  const tenantPays =
    weeklyOutgoings > 0 ? weeklyRentalIncome / weeklyOutgoings : 0;
  const taxmanPays =
    weeklyOutgoings > 0 ? weeklyTaxSavings / weeklyOutgoings : 0;
  const youPay = Math.max(0, 1 - tenantPays - taxmanPays);

  // ---- Capital growth & sale ----
  const annualGrowth = n(i.annualGrowthRate) / 100;
  const propertySoldPrice =
    n(i.propertyPrice) * Math.pow(1 + annualGrowth, n(i.holdingYears));
  const totalValueIncrease =
    n(i.propertyPrice) > 0
      ? (propertySoldPrice - n(i.propertyPrice)) / n(i.propertyPrice)
      : 0;

  // ---- Selling costs ----
  const totalSellingCosts =
    n(i.agentCommission) +
    n(i.sellAdvertising) +
    n(i.auctionCost) +
    n(i.dischargeMortgage) +
    n(i.settlementFee) +
    n(i.mortgageExitFee) +
    n(i.sellSolicitorsFee) +
    n(i.removalist) +
    n(i.otherSelling1);

  // ---- Cost base ----
  const propertyCostBase =
    totalPropertyCosts + n(i.initialRepairs) + totalSellingCosts;
  const totalCapitalWorksDeducted =
    n(i.capitalWorks) * n(i.holdingYears);
  const reducedCostBase = propertyCostBase - totalCapitalWorksDeducted;

  // ---- Capital gain ----
  const grossGain = propertySoldPrice - totalPropertyCosts - totalSellingCosts;
  const capitalGain = propertySoldPrice - reducedCostBase;

  // ---- CGT (SMSF specific) ----
  // Accumulation: 1/3 discount if held >12 months → effective 10%
  // Pension: 0% (current pension assets exempt)
  const heldOverYear = n(i.holdingYears) >= 1;
  const cgtDiscount =
    heldOverYear && i.smsfStage === "Accumulation" ? 1 / 3 : 0;
  const taxableCapitalGain =
    i.smsfStage === "Pension"
      ? 0
      : Math.max(0, capitalGain) * (1 - cgtDiscount);
  const cgtRate = i.smsfStage === "Pension" ? 0 : n(i.taxRate) / 100;
  const capitalGainTax = Math.max(0, taxableCapitalGain * cgtRate);

  // ---- Year-by-year projection ----
  const projection = [];
  let cumulativeCashFlow = 0;
  const rentGrowth = n(i.rentGrowthRate) / 100;
  const expGrowth = n(i.expenseInflation) / 100;

  for (let year = 1; year <= n(i.holdingYears); year++) {
    const propValue = n(i.propertyPrice) * Math.pow(1 + annualGrowth, year);

    const yearWeeklyRent = n(i.weeklyRental) * Math.pow(1 + rentGrowth, year - 1);
    const yearAnnualRent = yearWeeklyRent * n(i.rentedWeeks);
    const yearOtherIncome =
      n(i.otherRentalIncome) * Math.pow(1 + rentGrowth, year - 1);
    const yearGrossRent = yearAnnualRent + yearOtherIncome;

    const yearOpEx = operatingExpenses * Math.pow(1 + expGrowth, year - 1);
    const yearLoan = loanSchedule[year - 1] || {
      interestPaid: 0,
      principalPaid: 0,
      annualPayment: 0,
      closingBalance: loanAmount,
    };
    const yearInterest = yearLoan.interestPaid;
    const yearLoanPayment = yearLoan.annualPayment;
    const yearOutgoingsTax = yearOpEx + yearInterest; // for tax calc
    const yearOutgoingsCash = yearOpEx + yearLoanPayment; // for cash flow
    const yearPreTaxCF = yearGrossRent - yearOutgoingsCash;
    const yearPreTaxCFTax = yearGrossRent - yearOutgoingsTax;

    const yearBorrowDed = year <= 5 ? borrowingExpDeduction : 0;
    const yearTaxable =
      yearPreTaxCFTax -
      yearBorrowDed -
      n(i.declineInValue) -
      n(i.capitalWorks);
    const yearTaxSavings =
      yearTaxable < 0 ? Math.abs(yearTaxable) * (n(i.taxRate) / 100) : 0;
    const yearTaxOwed =
      yearTaxable > 0 ? yearTaxable * (n(i.taxRate) / 100) : 0;
    const yearAfterTaxCF = yearPreTaxCF + yearTaxSavings - yearTaxOwed;

    cumulativeCashFlow += yearAfterTaxCF;

    projection.push({
      year,
      propValue,
      grossRent: yearGrossRent,
      outgoings: yearOutgoingsCash,
      interestPaid: yearInterest,
      principalPaid: yearLoan.principalPaid,
      loanBalance: yearLoan.closingBalance,
      preTaxCF: yearPreTaxCF,
      taxImpact: yearTaxSavings - yearTaxOwed,
      afterTaxCF: yearAfterTaxCF,
      cumulativeCF: cumulativeCashFlow,
      equity: propValue - yearLoan.closingBalance,
      netPosition:
        propValue -
        yearLoan.closingBalance +
        cumulativeCashFlow -
        initialCashOutlay,
    });
  }

  const totalCashOutOverYears = projection.reduce(
    (s, y) => s + (y.afterTaxCF < 0 ? Math.abs(y.afterTaxCF) : 0),
    0,
  );
  const totalCashInOverYears = projection.reduce(
    (s, y) => s + (y.afterTaxCF > 0 ? y.afterTaxCF : 0),
    0,
  );
  const netCashFlowOverYears = totalCashInOverYears - totalCashOutOverYears;

  // ---- Profit & ROI ----
  // For P&I loans, total principal repaid is part of equity, included in profit
  const totalPrincipalRepaid = projection.reduce(
    (s, y) => s + y.principalPaid,
    0,
  );
  const finalLoanBalance =
    projection.length > 0
      ? projection[projection.length - 1].loanBalance
      : loanAmount;
  const netProceedsFromSale =
    propertySoldPrice - finalLoanBalance - totalSellingCosts - capitalGainTax;
  const totalReturn =
    netProceedsFromSale + netCashFlowOverYears - initialCashOutlay;

  const afterTaxProfit = totalReturn;
  const roiOnCostBase =
    propertyCostBase > 0 ? afterTaxProfit / propertyCostBase : 0;
  const totalCashInvestment = initialCashOutlay + totalCashOutOverYears;
  const roiOnCash =
    totalCashInvestment > 0 ? afterTaxProfit / totalCashInvestment : 0;
  const annualizedROI =
    n(i.holdingYears) > 0 && totalCashInvestment > 0 && 1 + roiOnCash > 0
      ? Math.pow(1 + roiOnCash, 1 / n(i.holdingYears)) - 1
      : 0;

  // ---- SMSF cash flow ----
  const smsfPreTaxCF =
    n(i.sgcContributions) +
    n(i.salarySacrifice) +
    preTaxRealCashFlow -
    n(i.accountingFees);
  const smsfTaxOnContributions =
    (n(i.sgcContributions) + n(i.salarySacrifice)) * 0.15;
  const smsfAfterTaxCF =
    smsfPreTaxCF - smsfTaxOnContributions + annualTaxSavings;

  // ---- Concessional cap warning ----
  const totalConcessional =
    n(i.sgcContributions) + n(i.salarySacrifice);
  const CONCESSIONAL_CAP = 30000; // 2024–25 cap, current at FY 2025-26
  const overCap = totalConcessional > CONCESSIONAL_CAP;
  const overCapAmount = overCap ? totalConcessional - CONCESSIONAL_CAP : 0;

  return {
    // Inputs echoed
    stampDuty,
    deposit,
    monthlyLoanPayment,

    // Property & funds
    totalPropertyCosts,
    totalBorrowingExp,
    totalFundsRequired,
    initialCashOutlay,
    loanAmount,
    lvr,

    // Year 1 cash flow
    interestOnLoan,
    principalRepaid,
    annualLoanPayment,
    operatingExpenses,
    totalOutgoings,
    totalCashOutgoings,
    weeklyOutgoings,
    annualRental,
    grossRent,
    grossRentalYield,
    netRentalYield,
    netYieldAfterInterest,
    borrowingExpDeduction,
    preTaxCashFlow,
    preTaxRealCashFlow,
    taxableIncome,
    annualTaxSavings,
    annualTaxOwed,
    afterTaxCashFlow,
    weeklyTaxSavings,
    weeklyAfterTax,
    weeklyRentalIncome,

    // Who pays
    tenantPays,
    taxmanPays,
    youPay,

    // Sale & capital gain
    propertySoldPrice,
    totalValueIncrease,
    totalSellingCosts,
    propertyCostBase,
    totalCapitalWorksDeducted,
    reducedCostBase,
    grossGain,
    capitalGain,
    taxableCapitalGain,
    capitalGainTax,
    finalLoanBalance,
    totalPrincipalRepaid,
    netProceedsFromSale,

    // Projection
    projection,
    totalCashOutOverYears,
    totalCashInOverYears,
    netCashFlowOverYears,
    totalCashInvestment,
    afterTaxProfit,
    roiOnCostBase,
    roiOnCash,
    annualizedROI,

    // SMSF
    smsfPreTaxCF,
    smsfTaxOnContributions,
    smsfAfterTaxCF,
    totalConcessional,
    overCap,
    overCapAmount,
    concessionalCap: CONCESSIONAL_CAP,
  };
}
