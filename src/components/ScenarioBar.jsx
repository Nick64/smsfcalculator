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
    <div className="bg-[#141518] border border-[#2a2d33] rounded-sm p-3 flex flex-wrap items-center gap-2 no-print">
      <div className="flex items-center gap-1.5 mr-1">
        <Bookmark size={13} className="text-[#5DB87A]" strokeWidth={2} />
        <span className="text-[11px] uppercase tracking-[0.08em] text-stone-300 font-semibold">
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
          className="flex items-center gap-1 bg-[#141518] border border-[#2a2d33] rounded-sm pl-2 pr-1 py-1 group"
        >
          <button
            onClick={() => onLoad(s)}
            className="text-[11.5px] text-stone-300 hover:text-[#5DB87A] font-medium"
          >
            {s.name}
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="text-stone-400 hover:text-[#E07B5C] transition-colors p-0.5 opacity-0 group-hover:opacity-100"
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
            className="text-[11.5px] border border-[#2a2d33] rounded-sm px-2 py-1 w-36 focus:border-[#2b8fe0] focus:outline-none"
          />
          <button
            onClick={handleSave}
            className="bg-[#2b8fe0] text-stone-50 px-2 py-1 text-[10px] uppercase tracking-[0.06em] font-semibold rounded-sm hover:bg-[#4FA8F0]"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowSaveInput(false);
              setSavingName("");
            }}
            className="text-stone-400 hover:text-stone-300 px-1"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveInput(true)}
          className="flex items-center gap-1 text-[11px] text-stone-300 hover:text-[#5DB87A] border border-[#2a2d33] rounded-sm px-2 py-1 hover:bg-[#1c1e22] transition-colors"
        >
          <Plus size={12} /> Save current
        </button>
      )}

      {scenarios.length >= 2 && (
        <button
          onClick={onOpenCompare}
          className="ml-auto flex items-center gap-1 bg-[#2b8fe0] text-stone-50 hover:bg-[#4FA8F0] text-[11px] uppercase tracking-[0.06em] font-semibold rounded-sm px-2.5 py-1 transition-colors"
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#141518] rounded-sm shadow-xl border border-[#2a2d33] max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#141518] flex items-center justify-between px-5 py-4 border-b border-[#2a2d33]">
          <h3
            className="text-[20px] text-stone-100"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
          >
            Compare scenarios
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[#2a2d33] text-[10.5px] uppercase tracking-[0.06em] text-stone-400">
                <th className="text-left py-2 font-semibold sticky left-0 bg-[#141518] pr-3">
                  Metric
                </th>
                {computed.map((s) => (
                  <th key={s.id} className="text-right py-2 font-semibold pl-3 min-w-[140px]">
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="text-[14px] text-stone-100 normal-case tracking-normal"
                        style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
                      >
                        {s.name}
                      </span>
                      <button
                        onClick={() => onLoad(s)}
                        className="text-[10px] text-[#5DB87A] hover:text-[#5DB87A] normal-case tracking-normal"
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
    <tr className="border-b border-[#1c1e22]">
      <td
        className={`py-2 pr-3 sticky left-0 bg-[#141518] ${bold ? "font-semibold text-stone-100" : "text-stone-400"}`}
      >
        {label}
      </td>
      {values.map((v, idx) => {
        const accent = accents[idx];
        const colorClass =
          accent === "positive"
            ? "text-[#5DB87A]"
            : accent === "negative"
              ? "text-[#E07B5C]"
              : "text-stone-100";
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
        className="pt-4 pb-1 text-[10px] uppercase tracking-[0.1em] text-stone-500 font-semibold border-b border-[#2a2d33] sticky left-0 bg-[#141518]"
      >
        {label}
      </td>
    </tr>
  );
}
