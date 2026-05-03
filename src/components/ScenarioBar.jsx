import { useState } from "react";
import { Bookmark, Trash2, Plus, BarChart3, X } from "lucide-react";
import { calculate } from "../lib/calculator";
import { fmtCurrencyShort, fmtPct, fmtCurrency } from "../lib/formatters";

export function ScenarioBar({
  scenarios,
  onSave,
  onLoad,
  onDelete,
  onOpenCompare,
  currentInputs,
}) {
  const [savingName, setSavingName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  function handleSave() {
    if (!savingName.trim()) return;
    onSave(savingName.trim());
    setSavingName("");
    setShowSaveInput(false);
  }

  return (
    <div className="bg-white border border-stone-200 rounded-sm p-3 flex flex-wrap items-center gap-2 no-print">
      <div className="flex items-center gap-1.5 mr-1">
        <Bookmark size={13} className="text-emerald-900" strokeWidth={2} />
        <span className="text-[11px] uppercase tracking-[0.08em] text-stone-700 font-semibold">
          Scenarios
        </span>
      </div>

      {scenarios.length === 0 && !showSaveInput && (
        <span className="text-[11.5px] text-stone-500 italic">
          No saved scenarios yet
        </span>
      )}

      {scenarios.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-sm pl-2 pr-1 py-1 group"
        >
          <button
            onClick={() => onLoad(s)}
            className="text-[11.5px] text-stone-700 hover:text-emerald-900 font-medium"
          >
            {s.name}
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="text-stone-400 hover:text-orange-700 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
            title="Delete scenario"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {showSaveInput ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="Scenario name"
            value={savingName}
            onChange={(e) => setSavingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setShowSaveInput(false);
                setSavingName("");
              }
            }}
            autoFocus
            className="text-[11.5px] border border-stone-300 rounded-sm px-2 py-1 w-36 focus:border-emerald-800 focus:outline-none"
          />
          <button
            onClick={handleSave}
            className="bg-emerald-900 text-emerald-50 px-2 py-1 text-[10px] uppercase tracking-[0.06em] font-semibold rounded-sm hover:bg-emerald-800"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowSaveInput(false);
              setSavingName("");
            }}
            className="text-stone-400 hover:text-stone-700 px-1"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveInput(true)}
          className="flex items-center gap-1 text-[11px] text-stone-700 hover:text-emerald-900 border border-stone-300 rounded-sm px-2 py-1 hover:bg-stone-50 transition-colors"
        >
          <Plus size={12} /> Save current
        </button>
      )}

      {scenarios.length >= 2 && (
        <button
          onClick={onOpenCompare}
          className="ml-auto flex items-center gap-1 bg-emerald-900 text-emerald-50 hover:bg-emerald-800 text-[11px] uppercase tracking-[0.06em] font-semibold rounded-sm px-2.5 py-1 transition-colors"
        >
          <BarChart3 size={11} /> Compare ({scenarios.length})
        </button>
      )}
    </div>
  );
}

export function ScenarioCompareModal({ scenarios, onClose, onLoad }) {
  const computed = scenarios.map((s) => ({
    ...s,
    results: calculate(s.inputs),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-sm shadow-xl border border-stone-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h3
            className="text-[20px] text-stone-900"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
          >
            Compare scenarios
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-stone-300 text-[10.5px] uppercase tracking-[0.06em] text-stone-600">
                <th className="text-left py-2 font-semibold sticky left-0 bg-white pr-3">
                  Metric
                </th>
                {computed.map((s) => (
                  <th key={s.id} className="text-right py-2 font-semibold pl-3 min-w-[140px]">
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="text-[14px] text-stone-900 normal-case tracking-normal"
                        style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
                      >
                        {s.name}
                      </span>
                      <button
                        onClick={() => onLoad(s)}
                        className="text-[10px] text-emerald-900 hover:text-emerald-700 normal-case tracking-normal"
                      >
                        Load →
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <CompareRow
                label="Property price"
                values={computed.map((s) => fmtCurrency(s.inputs.propertyPrice))}
              />
              <CompareRow
                label="State"
                values={computed.map((s) => s.inputs.state)}
              />
              <CompareRow
                label="Initial cash outlay"
                values={computed.map((s) => fmtCurrency(s.results.initialCashOutlay))}
              />
              <CompareRow
                label="LVR"
                values={computed.map((s) => fmtPct(s.results.lvr, 1))}
              />
              <CompareRow
                label="Loan type"
                values={computed.map((s) =>
                  s.inputs.loanType === "InterestOnly" ? "I/O" : "P&I",
                )}
              />
              <CompareRow
                label="Holding period"
                values={computed.map((s) => `${s.inputs.holdingYears} yrs`)}
              />
              <CompareRow
                label="SMSF stage"
                values={computed.map((s) => s.inputs.smsfStage)}
              />
              <SectionRow label="Year 1" />
              <CompareRow
                label="Weekly net cash flow"
                values={computed.map((s) =>
                  fmtCurrency(s.results.weeklyAfterTax, 2),
                )}
                accents={computed.map((s) =>
                  s.results.weeklyAfterTax >= 0 ? "positive" : "negative",
                )}
              />
              <CompareRow
                label="Gross rental yield"
                values={computed.map((s) => fmtPct(s.results.grossRentalYield))}
              />
              <SectionRow label="At Sale" />
              <CompareRow
                label="Property sold price"
                values={computed.map((s) => fmtCurrencyShort(s.results.propertySoldPrice))}
              />
              <CompareRow
                label="Capital gain tax"
                values={computed.map((s) => fmtCurrency(s.results.capitalGainTax))}
              />
              <CompareRow
                label="After-tax profit"
                values={computed.map((s) => fmtCurrencyShort(s.results.afterTaxProfit))}
                accents={computed.map((s) =>
                  s.results.afterTaxProfit >= 0 ? "positive" : "negative",
                )}
                bold
              />
              <CompareRow
                label="ROI on cash"
                values={computed.map((s) => fmtPct(s.results.roiOnCash, 1))}
              />
              <CompareRow
                label="Annualised ROI"
                values={computed.map((s) => fmtPct(s.results.annualizedROI, 1))}
                accents={computed.map(() => "positive")}
                bold
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, values, accents = [], bold = false }) {
  return (
    <tr className="border-b border-stone-100">
      <td
        className={`py-2 pr-3 sticky left-0 bg-white ${bold ? "font-semibold text-stone-900" : "text-stone-600"}`}
      >
        {label}
      </td>
      {values.map((v, idx) => {
        const accent = accents[idx];
        const colorClass =
          accent === "positive"
            ? "text-emerald-800"
            : accent === "negative"
              ? "text-orange-800"
              : "text-stone-900";
        return (
          <td
            key={idx}
            className={`text-right py-2 pl-3 ${bold ? "font-semibold" : ""} ${colorClass}`}
          >
            {v}
          </td>
        );
      })}
    </tr>
  );
}

function SectionRow({ label }) {
  return (
    <tr>
      <td
        colSpan={99}
        className="pt-4 pb-1 text-[10px] uppercase tracking-[0.1em] text-stone-500 font-semibold border-b border-stone-200 sticky left-0 bg-white"
      >
        {label}
      </td>
    </tr>
  );
}
