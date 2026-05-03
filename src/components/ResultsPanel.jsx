import { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle } from "lucide-react";
import {
  KPICard,
  ResultRow,
  CardPanel,
  LegendDot,
  Pill,
} from "./primitives";
import { fmtCurrency, fmtCurrencyShort, fmtPct } from "../lib/formatters";

export function ResultsPanel({ inputs, results }) {
  const r = results;
  const cashFlowIsNegative = r.afterTaxCashFlow < 0;

  const whoPaysData = useMemo(
    () =>
      [
        { name: "Tenant", value: r.tenantPays * 100, fill: "#2b8fe0" },
        { name: "Tax Office", value: r.taxmanPays * 100, fill: "#E5B568" },
        { name: "You", value: r.youPay * 100, fill: "#E07B5C" },
      ].filter((d) => d.value > 0.01),
    [r.tenantPays, r.taxmanPays, r.youPay],
  );

  return (
    <div className="space-y-5">
      {/* CONCESSIONAL CAP WARNING */}
      {r.overCap && (
        <div className="bg-[#E5B568]/10 border border-[#E5B568]/40 rounded-sm p-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-[#E5B568] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-[#E5B568] mb-0.5">
              Concessional contributions exceed the cap
            </div>
            <div className="text-[11.5px] text-[#E5B568] leading-relaxed">
              SGC + salary sacrifice ({fmtCurrency(r.totalConcessional)}) exceeds
              the {fmtCurrency(r.concessionalCap)} concessional cap by{" "}
              <strong>{fmtCurrency(r.overCapAmount)}</strong>. The excess is taxed
              at marginal rate via Division 293 / excess contributions tax. Consider
              spreading contributions or using carry-forward unused cap if eligible.
            </div>
          </div>
        </div>
      )}

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Initial Cash Outlay"
          value={fmtCurrency(r.initialCashOutlay)}
          sub={`LVR ${fmtPct(r.lvr, 1)} · Loan ${fmtCurrencyShort(r.loanAmount)}`}
        />
        <KPICard
          label={cashFlowIsNegative ? "Weekly Out-of-Pocket" : "Weekly Surplus"}
          value={fmtCurrency(Math.abs(r.weeklyAfterTax), 2)}
          sub={cashFlowIsNegative ? "Negative gearing" : "Positively geared"}
          accent={cashFlowIsNegative ? "negative" : "positive"}
        />
        <KPICard
          label={`After-Tax Profit (${inputs.holdingYears}yr)`}
          value={fmtCurrencyShort(r.afterTaxProfit)}
          sub={`Sale price ${fmtCurrencyShort(r.propertySoldPrice)}`}
          accent={r.afterTaxProfit > 0 ? "positive" : "negative"}
        />
        <KPICard
          label="Annualised ROI"
          value={fmtPct(r.annualizedROI, 1)}
          sub={`Total return ${fmtPct(r.roiOnCash, 1)} on cash`}
          accent="gold"
        />
      </div>

      {/* HEADLINE PROJECTION CHART */}
      <CardPanel
        title={`Wealth trajectory over ${inputs.holdingYears} years`}
        action={
          <Pill variant={inputs.loanType === "InterestOnly" ? "default" : "blue"}>
            {inputs.loanType === "InterestOnly" ? "Interest Only" : "P&I Loan"}
          </Pill>
        }
      >
        <p className="text-[11.5px] text-stone-500 -mt-2 mb-3 leading-snug">
          Property value compounds at {inputs.annualGrowthRate}% p.a. Cumulative
          cash flow assumes {inputs.rentGrowthRate}% rent growth and{" "}
          {inputs.expenseInflation}% expense inflation.
          {inputs.loanType === "PrincipalAndInterest" &&
            " Loan principal pays down over the term."}
        </p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer>
            <AreaChart
              data={r.projection}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2b8fe0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2b8fe0" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E5B568" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E5B568" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2a2d33" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: "#9ca0a8" }}
                axisLine={{ stroke: "#2a2d33" }}
                tickLine={false}
                tickFormatter={(v) => `Y${v}`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca0a8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtCurrencyShort(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1c1e22",
                  border: "1px solid #2a2d33",
                  borderRadius: 2,
                  fontSize: 12,
                  fontFamily: "Manrope, sans-serif",
                  color: "#f5f5f4",
                }}
                itemStyle={{ color: "#f5f5f4" }}
                labelStyle={{ color: "#9ca0a8" }}
                formatter={(v, name) => [fmtCurrency(v), name]}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Area
                type="monotone"
                dataKey="propValue"
                name="Property Value"
                stroke="#2b8fe0"
                strokeWidth={2}
                fill="url(#propGrad)"
              />
              <Area
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="#E5B568"
                strokeWidth={2}
                fill="url(#equityGrad)"
              />
              <Line
                type="monotone"
                dataKey="cumulativeCF"
                name="Cumulative Cash Flow"
                stroke="#E07B5C"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-[11px] text-stone-400">
          <LegendDot color="#2b8fe0" label="Property Value" />
          <LegendDot color="#E5B568" label="Equity (Value − Loan)" />
          <LegendDot color="#E07B5C" label="Cumulative Cash Flow" dashed />
        </div>
      </CardPanel>

      {/* WHO PAYS + YIELD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CardPanel title="Who pays the weekly outgoings?">
          <div className="flex items-center gap-4">
            <div className="w-[140px] h-[140px] flex-shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={whoPaysData}
                    innerRadius={42}
                    outerRadius={66}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {whoPaysData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {whoPaysData.map((d) => (
                <div key={d.name}>
                  <div className="flex items-baseline justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.fill }}
                      />
                      <span className="text-[12px] text-stone-300 font-medium">
                        {d.name}
                      </span>
                    </div>
                    <span
                      className="text-[13px] font-semibold tabular-nums"
                      style={{ color: d.fill }}
                    >
                      {d.value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 bg-[#1c1e22] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, d.value)}%`,
                        backgroundColor: d.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#2a2d33] mt-4 pt-3 space-y-1">
            <ResultRow
              label="Weekly outgoings"
              value={fmtCurrency(r.weeklyOutgoings, 2)}
            />
            <ResultRow
              label="Weekly rental income"
              value={fmtCurrency(r.weeklyRentalIncome, 2)}
              accent="positive"
            />
            <ResultRow
              label="Weekly tax savings"
              value={fmtCurrency(r.weeklyTaxSavings, 2)}
              accent="positive"
            />
            <ResultRow
              label={cashFlowIsNegative ? "Weekly out-of-pocket" : "Weekly surplus"}
              value={fmtCurrency(Math.abs(r.weeklyAfterTax), 2)}
              accent={cashFlowIsNegative ? "negative" : "positive"}
              bold
            />
          </div>
        </CardPanel>

        <CardPanel title="Yield & cash flow snapshot (Year 1)">
          <ResultRow label="Gross rental yield" value={fmtPct(r.grossRentalYield)} />
          <ResultRow label="Net yield (before interest)" value={fmtPct(r.netRentalYield)} />
          <ResultRow
            label="Net yield (after interest)"
            value={fmtPct(r.netYieldAfterInterest)}
            accent={r.netYieldAfterInterest >= 0 ? "positive" : "negative"}
          />
          <div className="border-t border-[#2a2d33] my-2.5" />
          <ResultRow label="Annual rental income" value={fmtCurrency(r.annualRental)} />
          <ResultRow
            label="Total annual outgoings"
            value={fmtCurrency(r.totalCashOutgoings)}
            accent="muted"
          />
          {inputs.loanType === "PrincipalAndInterest" && (
            <>
              <ResultRow label="Interest portion" value={fmtCurrency(r.interestOnLoan)} indent accent="muted" />
              <ResultRow label="Principal portion" value={fmtCurrency(r.principalRepaid)} indent accent="muted" />
            </>
          )}
          <ResultRow
            label="Pre-tax cash flow"
            value={fmtCurrency(r.preTaxRealCashFlow)}
            accent={r.preTaxRealCashFlow >= 0 ? "positive" : "negative"}
          />
          <ResultRow
            label="Annual tax savings"
            value={fmtCurrency(r.annualTaxSavings)}
            accent="positive"
          />
          <ResultRow
            label="After-tax cash flow"
            value={fmtCurrency(r.afterTaxCashFlow)}
            accent={r.afterTaxCashFlow >= 0 ? "positive" : "negative"}
            bold
          />
          <div className="border-t border-[#2a2d33] my-2.5" />
          <ResultRow
            label="Monthly loan payment"
            value={fmtCurrency(r.monthlyLoanPayment, 2)}
            accent="muted"
          />
        </CardPanel>
      </div>

      {/* CAPITAL GAIN + SMSF CASH FLOW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CardPanel title="Capital gain & after-tax profit">
          <ResultRow label="Property sale price" value={fmtCurrency(r.propertySoldPrice)} />
          <ResultRow
            label="Total value increase"
            value={fmtPct(r.totalValueIncrease, 1)}
            accent="muted"
            indent
          />
          <div className="border-t border-[#2a2d33] my-2.5" />
          <ResultRow label="Property cost base" value={fmtCurrency(r.propertyCostBase)} bold />
          <ResultRow
            label="Less capital works deducted"
            value={"−" + fmtCurrency(r.totalCapitalWorksDeducted)}
            accent="muted"
            indent
          />
          <ResultRow label="Reduced cost base" value={fmtCurrency(r.reducedCostBase)} bold />
          <div className="border-t border-[#2a2d33] my-2.5" />
          <ResultRow
            label="Gross gain"
            value={fmtCurrency(r.grossGain)}
            accent={r.grossGain > 0 ? "positive" : "negative"}
            bold
          />
          <ResultRow label="Capital gain (for CGT)" value={fmtCurrency(r.capitalGain)} />
          <ResultRow
            label={`CGT (${inputs.smsfStage}${inputs.smsfStage === "Accumulation" ? ", 1/3 discount" : ""})`}
            value={fmtCurrency(r.capitalGainTax)}
            accent={r.capitalGainTax > 0 ? "negative" : "muted"}
          />
          <div className="border-t border-[#2a2d33] my-2.5" />
          {inputs.loanType === "PrincipalAndInterest" && (
            <ResultRow
              label="Total principal repaid"
              value={fmtCurrency(r.totalPrincipalRepaid)}
              accent="positive"
            />
          )}
          <ResultRow
            label="Net proceeds from sale"
            value={fmtCurrency(r.netProceedsFromSale)}
            accent={r.netProceedsFromSale > 0 ? "positive" : "negative"}
          />
          <ResultRow
            label="Net cash flow over period"
            value={fmtCurrency(r.netCashFlowOverYears)}
            accent={r.netCashFlowOverYears >= 0 ? "positive" : "negative"}
          />
          <ResultRow
            label="Less initial cash outlay"
            value={"−" + fmtCurrency(r.initialCashOutlay)}
            accent="muted"
          />
          <ResultRow
            label="After-tax profit"
            value={fmtCurrency(r.afterTaxProfit)}
            accent={r.afterTaxProfit > 0 ? "positive" : "negative"}
            bold
          />
          <ResultRow label="ROI on cash invested" value={fmtPct(r.roiOnCash, 1)} accent="muted" />
          <ResultRow
            label="Annualised ROI"
            value={fmtPct(r.annualizedROI, 1)}
            bold
            accent="positive"
          />
        </CardPanel>

        <CardPanel title="SMSF annual cash flow">
          <ResultRow
            label="SGC contributions"
            value={fmtCurrency(inputs.sgcContributions)}
            accent="positive"
          />
          <ResultRow
            label="Salary sacrifice"
            value={fmtCurrency(inputs.salarySacrifice)}
            accent="positive"
          />
          <ResultRow
            label="Net rental property cash flow"
            value={fmtCurrency(r.preTaxRealCashFlow)}
            accent={r.preTaxRealCashFlow >= 0 ? "positive" : "negative"}
          />
          <ResultRow
            label="Less accounting & admin"
            value={"−" + fmtCurrency(inputs.accountingFees)}
            accent="muted"
          />
          <ResultRow label="SMSF pre-tax cash flow" value={fmtCurrency(r.smsfPreTaxCF)} bold />
          <div className="border-t border-[#2a2d33] my-2.5" />
          <ResultRow
            label="Less 15% contributions tax"
            value={"−" + fmtCurrency(r.smsfTaxOnContributions)}
            accent="muted"
          />
          <ResultRow
            label="Add tax savings on rental loss"
            value={fmtCurrency(r.annualTaxSavings)}
            accent="positive"
          />
          <ResultRow
            label="SMSF after-tax cash flow"
            value={fmtCurrency(r.smsfAfterTaxCF)}
            accent={r.smsfAfterTaxCF >= 0 ? "positive" : "negative"}
            bold
          />
          <div className="border-t border-[#2a2d33] my-3 mb-2" />
          <p className="text-[11px] text-stone-500 leading-snug italic">
            Concessional cap is currently {fmtCurrency(r.concessionalCap)} p.a.
            Contributions above the cap may incur Division 293 tax. Verify with
            your accountant.
          </p>
        </CardPanel>
      </div>

      {/* YEAR-BY-YEAR TABLE */}
      <CardPanel title="Year-by-year projection">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-[11.5px] tabular-nums">
            <thead>
              <tr className="border-b border-[#2a2d33] text-stone-400 text-[10px] uppercase tracking-[0.06em]">
                <th className="text-left py-2 font-semibold">Year</th>
                <th className="text-right py-2 font-semibold">Property</th>
                <th className="text-right py-2 font-semibold">Gross Rent</th>
                <th className="text-right py-2 font-semibold">Outgoings</th>
                {inputs.loanType === "PrincipalAndInterest" && (
                  <th className="text-right py-2 font-semibold">Loan Bal.</th>
                )}
                <th className="text-right py-2 font-semibold">Pre-tax CF</th>
                <th className="text-right py-2 font-semibold">Tax</th>
                <th className="text-right py-2 font-semibold">After-tax CF</th>
                <th className="text-right py-2 font-semibold">Cum. CF</th>
                <th className="text-right py-2 font-semibold">Equity</th>
              </tr>
            </thead>
            <tbody>
              {r.projection.map((y) => (
                <tr key={y.year} className="border-b border-[#1c1e22] hover:bg-[#1c1e22]/60">
                  <td className="py-2 font-medium text-stone-300">Y{y.year}</td>
                  <td className="text-right py-2 text-stone-100">{fmtCurrency(y.propValue)}</td>
                  <td className="text-right py-2 text-stone-300">{fmtCurrency(y.grossRent)}</td>
                  <td className="text-right py-2 text-stone-500">−{fmtCurrency(y.outgoings).replace("$", "$")}</td>
                  {inputs.loanType === "PrincipalAndInterest" && (
                    <td className="text-right py-2 text-stone-500">{fmtCurrency(y.loanBalance)}</td>
                  )}
                  <td className={`text-right py-2 ${y.preTaxCF >= 0 ? "text-[#5DB87A]" : "text-[#E07B5C]"}`}>
                    {fmtCurrency(y.preTaxCF)}
                  </td>
                  <td className={`text-right py-2 ${y.taxImpact >= 0 ? "text-[#5DB87A]" : "text-[#E07B5C]"}`}>
                    {y.taxImpact >= 0 ? "+" : ""}
                    {fmtCurrency(y.taxImpact)}
                  </td>
                  <td className={`text-right py-2 font-semibold ${y.afterTaxCF >= 0 ? "text-[#5DB87A]" : "text-[#E07B5C]"}`}>
                    {fmtCurrency(y.afterTaxCF)}
                  </td>
                  <td className={`text-right py-2 ${y.cumulativeCF >= 0 ? "text-stone-100" : "text-[#E07B5C]"}`}>
                    {fmtCurrency(y.cumulativeCF)}
                  </td>
                  <td className="text-right py-2 font-semibold text-[#E5B568]">
                    {fmtCurrency(y.equity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10.5px] text-stone-500 mt-3 italic leading-snug">
          {inputs.loanType === "InterestOnly"
            ? "Interest-only loan: equity grows from capital appreciation only. "
            : "P&I loan: equity grows from both appreciation and principal repayments. "}
          Tax column is positive when receiving a refund/reduction, negative when tax is owed.
        </p>
      </CardPanel>

      {/* FUNDS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CardPanel title="Funds required at settlement">
          <ResultRow
            label="Property price"
            value={fmtCurrency(inputs.propertyPrice)}
          />
          <ResultRow
            label="Stamp duty"
            value={fmtCurrency(r.stampDuty)}
            accent="muted"
          />
          <ResultRow
            label="Other acquisition costs"
            value={fmtCurrency(r.totalPropertyCosts - inputs.propertyPrice - r.stampDuty)}
            accent="muted"
          />
          <ResultRow
            label="Initial repairs"
            value={fmtCurrency(inputs.initialRepairs)}
            accent="muted"
          />
          <ResultRow
            label="Borrowing expenses"
            value={fmtCurrency(r.totalBorrowingExp)}
            accent="muted"
          />
          <ResultRow
            label="Total funds required"
            value={fmtCurrency(r.totalFundsRequired)}
            bold
          />
          <div className="border-t border-[#2a2d33] my-2.5" />
          <ResultRow
            label="Less your cash investment"
            value={"−" + fmtCurrency(r.initialCashOutlay)}
            accent="muted"
          />
          <ResultRow label="Home loan amount" value={fmtCurrency(r.loanAmount)} bold />
          <ResultRow
            label="Loan-to-Value Ratio"
            value={fmtPct(r.lvr, 2)}
            accent={r.lvr > 0.8 ? "negative" : "default"}
          />
          {r.lvr > 0.8 && (
            <p className="text-[11px] text-[#E07B5C] mt-2 italic">
              Most SMSF lenders require LVR ≤ 70-80%.
            </p>
          )}
        </CardPanel>

        <CardPanel title="Borrowing & deduction notes">
          <div className="text-[11.5px] text-stone-300 space-y-2.5 leading-relaxed">
            <p>
              <span className="font-semibold text-stone-100">Stamp duty</span>{" "}
              {inputs.autoStampDuty ? `auto-calculated for ${inputs.state}` : "manually set"}: {fmtCurrency(r.stampDuty)} ({fmtPct(r.stampDuty / inputs.propertyPrice, 2)} of price).
            </p>
            <p>
              <span className="font-semibold text-stone-100">Borrowing expenses</span> of {fmtCurrency(r.totalBorrowingExp)} are deducted at {fmtCurrency(r.borrowingExpDeduction)} per year for 5 years (ATO standard).
            </p>
            <p>
              <span className="font-semibold text-stone-100">Year-1 taxable income</span> from the property is {fmtCurrency(r.taxableIncome)} — when negative, the SMSF reduces tax on other contributions.
            </p>
            <p>
              <span className="font-semibold text-stone-100">CGT treatment:</span>{" "}
              {inputs.smsfStage === "Pension"
                ? "0% — assets supporting current pension liabilities are exempt."
                : "15% with a 1/3 discount if held >12 months — effective rate of 10%."}
            </p>
            <p className="text-stone-500 italic pt-1 border-t border-[#2a2d33]">
              Stamp duty estimates use standard residential investor brackets. SMSF
              bare trust structures, foreign surcharges, or special concessions may
              alter actual duty payable. Verify with a conveyancer.
            </p>
          </div>
        </CardPanel>
      </div>
    </div>
  );
}
