import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Field({
  label,
  hint,
  value,
  onChange,
  prefix = "",
  suffix = "",
  step = 1,
  type = "number",
  options = null,
  disabled = false,
}) {
  if (type === "select") {
    return (
      <div className="mb-3">
        <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-600 font-medium mb-1">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white border border-stone-300 rounded-sm px-2.5 py-1.5 text-sm font-medium text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800/20 disabled:bg-stone-100 disabled:text-stone-400"
        >
          {options &&
            options.map((opt) => (
              <option key={opt.value || opt.code} value={opt.value || opt.code}>
                {opt.label}
              </option>
            ))}
        </select>
        {hint && <p className="text-[10.5px] text-stone-500 mt-1 leading-snug">{hint}</p>}
      </div>
    );
  }

  if (type === "toggle") {
    return (
      <div className="mb-3 flex items-center justify-between">
        <div className="flex-1 pr-3">
          <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-600 font-medium">
            {label}
          </label>
          {hint && <p className="text-[10.5px] text-stone-500 mt-0.5 leading-snug">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
            value ? "bg-emerald-800" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
              value ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-600 font-medium mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) =>
            onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))
          }
          className={`w-full bg-white border border-stone-300 rounded-sm py-1.5 text-sm font-medium text-stone-900 tabular-nums focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800/20 disabled:bg-stone-100 disabled:text-stone-400 ${
            prefix ? "pl-6" : "pl-2.5"
          } ${suffix ? "pr-8" : "pr-2.5"}`}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[10.5px] text-stone-500 mt-1 leading-snug">{hint}</p>}
    </div>
  );
}

export function Section({ title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-stone-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} className="text-emerald-900" strokeWidth={1.75} />
          <span
            className="text-[13px] font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

export function KPICard({ label, value, sub, accent = "default", hint }) {
  const accentColors = {
    default: "text-stone-900",
    positive: "text-emerald-800",
    negative: "text-orange-800",
    gold: "text-amber-700",
  };
  return (
    <div className="bg-white border border-stone-200 rounded-sm p-4 flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-semibold leading-tight mb-2">
        {label}
      </span>
      <div
        className={`text-2xl md:text-[26px] font-medium tabular-nums leading-none ${accentColors[accent]}`}
        style={{ fontFamily: "Fraunces, serif", fontVariationSettings: "'opsz' 144" }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-stone-500 mt-1.5 leading-tight tabular-nums">
          {sub}
        </div>
      )}
      {hint && (
        <div className="text-[10px] text-stone-400 mt-2 italic leading-tight">{hint}</div>
      )}
    </div>
  );
}

export function ResultRow({ label, value, bold = false, indent = false, accent = "default" }) {
  const accentClasses = {
    default: "text-stone-900",
    positive: "text-emerald-800",
    negative: "text-orange-800",
    muted: "text-stone-500",
  };
  return (
    <div className={`flex items-baseline justify-between py-1 ${indent ? "pl-3" : ""}`}>
      <span
        className={`text-[12.5px] ${
          bold ? "font-semibold text-stone-900" : "text-stone-600"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-[12.5px] tabular-nums ${bold ? "font-semibold" : ""} ${
          accentClasses[accent]
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function CardPanel({ title, children, className = "", action = null }) {
  return (
    <div className={`bg-white border border-stone-200 rounded-sm ${className}`}>
      {(title || action) && (
        <div className="px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
          {title && (
            <h3
              className="text-[13px] font-semibold text-stone-900 tracking-tight"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function LegendDot({ color, label, dashed = false }) {
  return (
    <div className="flex items-center gap-1.5">
      {dashed ? (
        <span
          className="inline-block w-3 h-px border-t-[2px] border-dashed"
          style={{ borderColor: color }}
        />
      ) : (
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
    </div>
  );
}

export function Pill({ children, variant = "default" }) {
  const variants = {
    default: "bg-stone-100 text-stone-700 border-stone-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    danger: "bg-orange-50 text-orange-900 border-orange-200",
    forest: "bg-emerald-900 text-emerald-50 border-emerald-900",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-[0.06em] font-semibold border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
