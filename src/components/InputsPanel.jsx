import {
  Home,
  Banknote,
  Receipt,
  TrendingUp,
  PiggyBank,
  Landmark,
  Wallet,
  MapPin,
} from "lucide-react";
import { Field, Section } from "./primitives";
import { STATE_OPTIONS } from "../lib/stampDuty";

export function InputsPanel({ inputs, setInputs, computedStampDuty }) {
  const set = (key) => (val) => setInputs((s) => ({ ...s, [key]: val }));

  return (
    <div className="bg-white border border-stone-200 rounded-sm">
      <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/60">
        <h2 className="text-[13px] font-semibold text-stone-900 uppercase tracking-[0.08em]">
          Inputs
        </h2>
        <p className="text-[10.5px] text-stone-500 mt-0.5">
          Adjust any field — every result updates instantly.
        </p>
      </div>

      <Section title="Property" icon={Home} defaultOpen>
        <Field
          label="State"
          type="select"
          options={STATE_OPTIONS}
          value={inputs.state}
          onChange={set("state")}
          hint="Used for stamp duty calculation."
        />
        <Field
          label="Property Price"
          prefix="$"
          value={inputs.propertyPrice}
          onChange={set("propertyPrice")}
          step={1000}
        />
        <Field
          label="Auto-calculate stamp duty"
          type="toggle"
          value={inputs.autoStampDuty}
          onChange={set("autoStampDuty")}
          hint={
            inputs.autoStampDuty
              ? `Calculated: $${computedStampDuty.toLocaleString("en-AU")} (${inputs.state} 2025-26)`
              : "Toggle on for state-rate calculation."
          }
        />
        {!inputs.autoStampDuty && (
          <Field
            label="Stamp Duty (manual)"
            prefix="$"
            value={inputs.stampDutyOverride}
            onChange={set("stampDutyOverride")}
          />
        )}
        <Field
          label="Solicitor / Conveyancing"
          prefix="$"
          value={inputs.solicitorsFee}
          onChange={set("solicitorsFee")}
        />
        <Field
          label="Land Transfer / Registration"
          prefix="$"
          value={inputs.landTransferFee}
          onChange={set("landTransferFee")}
        />
        <Field
          label="Pre-purchase Inspections"
          prefix="$"
          value={inputs.preInspections}
          onChange={set("preInspections")}
        />
        <Field
          label="SMSF / Bare Trust Setup"
          prefix="$"
          value={inputs.smsfEstablishment}
          onChange={set("smsfEstablishment")}
          hint="LRBA structure: corporate trustee, bare trust deed, SMSF deed amendments."
        />
        <Field
          label="Other Acquisition Cost 1"
          prefix="$"
          value={inputs.otherPropCost1}
          onChange={set("otherPropCost1")}
        />
        <Field
          label="Other Acquisition Cost 2"
          prefix="$"
          value={inputs.otherPropCost2}
          onChange={set("otherPropCost2")}
        />
        <Field
          label="Initial Repairs / Renovations"
          prefix="$"
          value={inputs.initialRepairs}
          onChange={set("initialRepairs")}
          hint="Capital improvements before tenanting — added to cost base."
        />
      </Section>

      <Section title="Loan & Borrowing" icon={Banknote} defaultOpen>
        <Field
          label="Loan Type"
          type="select"
          options={[
            { value: "InterestOnly", label: "Interest Only (typical for SMSF)" },
            { value: "PrincipalAndInterest", label: "Principal & Interest" },
          ]}
          value={inputs.loanType}
          onChange={set("loanType")}
        />
        {inputs.loanType === "PrincipalAndInterest" && (
          <Field
            label="Loan Term (years)"
            value={inputs.loanTermYears}
            onChange={set("loanTermYears")}
            suffix="yr"
            hint="SMSF lenders typically cap at 25-30 years."
          />
        )}
        <Field
          label="Deposit %"
          suffix="%"
          value={inputs.depositPercentage}
          onChange={set("depositPercentage")}
          step={1}
          hint="Most SMSF lenders require 20–30% minimum."
        />
        <Field
          label="Interest Rate"
          suffix="%"
          value={inputs.interestRate}
          onChange={set("interestRate")}
          step={0.05}
        />
        <div className="border-t border-stone-200 my-3" />
        <Field
          label="Mortgage Registration Fee"
          prefix="$"
          value={inputs.mortRegFee}
          onChange={set("mortRegFee")}
        />
        <Field
          label="LMI"
          prefix="$"
          value={inputs.lmi}
          onChange={set("lmi")}
          hint="Rare for SMSF — most lenders cap LVR at 70-80%."
        />
        <Field
          label="Valuation Fee"
          prefix="$"
          value={inputs.valuationFee}
          onChange={set("valuationFee")}
        />
        <Field
          label="Loan Establishment Fees"
          prefix="$"
          value={inputs.loanEstFees}
          onChange={set("loanEstFees")}
        />
        <Field
          label="Title Search Fees"
          prefix="$"
          value={inputs.titleSearchFees}
          onChange={set("titleSearchFees")}
        />
        <Field
          label="Other Borrowing Cost 1"
          prefix="$"
          value={inputs.otherBorrow1}
          onChange={set("otherBorrow1")}
        />
        <Field
          label="Other Borrowing Cost 2"
          prefix="$"
          value={inputs.otherBorrow2}
          onChange={set("otherBorrow2")}
        />
      </Section>

      <Section title="Rental Income" icon={Wallet} defaultOpen>
        <Field
          label="Weekly Rent"
          prefix="$"
          value={inputs.weeklyRental}
          onChange={set("weeklyRental")}
          step={5}
        />
        <Field
          label="Rented Weeks per Year"
          suffix="wk"
          value={inputs.rentedWeeks}
          onChange={set("rentedWeeks")}
          hint="50 weeks (2 weeks vacancy) is common."
        />
        <Field
          label="Other Rental-related Income"
          prefix="$"
          value={inputs.otherRentalIncome}
          onChange={set("otherRentalIncome")}
          hint="e.g. parking, storage, furniture rental."
        />
      </Section>

      <Section title="Annual Outgoings" icon={Receipt}>
        <Field label="Body Corporate / Strata" prefix="$" value={inputs.bodyCorporate} onChange={set("bodyCorporate")} />
        <Field label="Council Rates" prefix="$" value={inputs.councilRates} onChange={set("councilRates")} />
        <Field label="Water Charges" prefix="$" value={inputs.water} onChange={set("water")} />
        <Field label="Insurance" prefix="$" value={inputs.insurance} onChange={set("insurance")} />
        <Field
          label="Property Manager Fees"
          prefix="$"
          value={inputs.propertyAgentFees}
          onChange={set("propertyAgentFees")}
          hint="Typically 6–8% of annual rent + letting fees."
        />
        <Field label="Repairs & Maintenance" prefix="$" value={inputs.repairs} onChange={set("repairs")} />
        <Field
          label="Land Tax"
          prefix="$"
          value={inputs.landTax}
          onChange={set("landTax")}
          hint="State-based — SMSFs typically have lower thresholds than individuals."
        />
        <Field label="Cleaning" prefix="$" value={inputs.cleaning} onChange={set("cleaning")} />
        <Field label="Gardening / Lawn" prefix="$" value={inputs.gardening} onChange={set("gardening")} />
        <Field label="Pest Control" prefix="$" value={inputs.pestControl} onChange={set("pestControl")} />
        <Field label="Advertising for Tenants" prefix="$" value={inputs.advertising} onChange={set("advertising")} />
        <Field label="Legal Expenses" prefix="$" value={inputs.legalExpenses} onChange={set("legalExpenses")} />
        <Field label="Travel" prefix="$" value={inputs.travel} onChange={set("travel")} />
        <Field label="Stationery / Phone / Postage" prefix="$" value={inputs.stationery} onChange={set("stationery")} />
        <Field
          label="SMSF-Deductible Expenses"
          prefix="$"
          value={inputs.smsfDeductible}
          onChange={set("smsfDeductible")}
          hint="Bank fees, ASIC fees, audit fees attributable to property."
        />
        <Field label="Sundry" prefix="$" value={inputs.sundry} onChange={set("sundry")} />
      </Section>

      <Section title="Tax & Depreciation" icon={Landmark}>
        <Field
          label="SMSF Tax Rate"
          suffix="%"
          value={inputs.taxRate}
          onChange={set("taxRate")}
          hint="15% in accumulation phase. Pension phase assets are 0%."
        />
        <Field
          label="Plant & Equipment Depreciation (Div 40)"
          prefix="$"
          value={inputs.declineInValue}
          onChange={set("declineInValue")}
          hint="Annual decline in value of removable assets — get a depreciation schedule from a quantity surveyor."
        />
        <Field
          label="Capital Works Deduction (Div 43)"
          prefix="$"
          value={inputs.capitalWorks}
          onChange={set("capitalWorks")}
          hint="2.5% p.a. of construction cost over 40 years (post-1987 builds)."
        />
      </Section>

      <Section title="Capital Growth & Sale" icon={TrendingUp}>
        <Field
          label="Holding Period (Years)"
          suffix="yr"
          value={inputs.holdingYears}
          onChange={set("holdingYears")}
          hint="Affects projection length and CGT discount eligibility."
        />
        <Field
          label="Annual Capital Growth"
          suffix="%"
          value={inputs.annualGrowthRate}
          onChange={set("annualGrowthRate")}
          step={0.1}
          hint="Long-run residential ~5–7% but varies by location/cycle."
        />
        <Field
          label="Annual Rent Growth"
          suffix="%"
          value={inputs.rentGrowthRate}
          onChange={set("rentGrowthRate")}
          step={0.1}
        />
        <Field
          label="Annual Expense Inflation"
          suffix="%"
          value={inputs.expenseInflation}
          onChange={set("expenseInflation")}
          step={0.1}
        />
        <div className="border-t border-stone-200 my-3" />
        <div className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold mb-2">
          Selling Costs
        </div>
        <Field label="Agent Commission" prefix="$" value={inputs.agentCommission} onChange={set("agentCommission")} />
        <Field label="Selling Solicitor" prefix="$" value={inputs.sellSolicitorsFee} onChange={set("sellSolicitorsFee")} />
        <Field label="Discharge of Mortgage" prefix="$" value={inputs.dischargeMortgage} onChange={set("dischargeMortgage")} />
        <Field label="Settlement Fee" prefix="$" value={inputs.settlementFee} onChange={set("settlementFee")} />
        <Field label="Sale Advertising" prefix="$" value={inputs.sellAdvertising} onChange={set("sellAdvertising")} />
        <Field label="Mortgage Exit Fee" prefix="$" value={inputs.mortgageExitFee} onChange={set("mortgageExitFee")} />
        <Field label="Other Selling Cost" prefix="$" value={inputs.otherSelling1} onChange={set("otherSelling1")} />
      </Section>

      <Section title="SMSF Cash Flow" icon={PiggyBank}>
        <Field
          label="SMSF Stage at Sale"
          type="select"
          options={[
            { value: "Pension", label: "Pension Phase (0% CGT)" },
            { value: "Accumulation", label: "Accumulation (10% effective)" },
          ]}
          value={inputs.smsfStage}
          onChange={set("smsfStage")}
        />
        <Field
          label="SGC Contributions (Annual)"
          prefix="$"
          value={inputs.sgcContributions}
          onChange={set("sgcContributions")}
          hint="Employer compulsory super."
        />
        <Field
          label="Salary Sacrifice (Annual)"
          prefix="$"
          value={inputs.salarySacrifice}
          onChange={set("salarySacrifice")}
          hint="Stay within concessional cap ($30k incl. SGC)."
        />
        <Field
          label="Accounting / Admin Fees"
          prefix="$"
          value={inputs.accountingFees}
          onChange={set("accountingFees")}
        />
      </Section>
    </div>
  );
}
