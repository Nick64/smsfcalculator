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
        <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-400 font-medium mb-1">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-[#1c1e22] border border-[#2a2d33] rounded-sm px-2.5 py-1.5 text-sm font-medium text-stone-100 focus:border-[#2b8fe0] focus:outline-none focus:ring-1 focus:ring-[#2b8fe0]/30 disabled:bg-[#141518] disabled:text-stone-600"
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
          <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-400 font-medium">
            {label}
          </label>
          {hint && <p className="text-[10.5px] text-stone-500 mt-0.5 leading-snug">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
            value ? "bg-[#2b8fe0]" : "bg-[#2a2d33]"
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
      <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-400 font-medium mb-1">
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
          className={`w-full bg-[#1c1e22] border border-[#2a2d33] rounded-sm py-1.5 text-sm font-medium text-stone-100 tabular-nums focus:border-[#2b8fe0] focus:outline-none focus:ring-1 focus:ring-[#2b8fe0]/30 disabled:bg-[#141518] disabled:text-stone-600 ${
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
    <div className="border-b border-[#2a2d33] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-[#1c1e22] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} className="text-[#2b8fe0]" strokeWidth={1.75} />
          <span
            className="text-[13px] font-semibold text-stone-100 tracking-tight"
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
    default: "text-stone-100",
    positive: "text-[#5DB87A]",
    negative: "text-[#E07B5C]",
    gold: "text-[#E5B568]",
    blue: "text-[#4FA8F0]",
  };
  return (
    <div className="bg-[#141518] border border-[#2a2d33] rounded-sm p-4 flex flex-col">
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
        <div className="text-[10px] text-stone-600 mt-2 italic leading-tight">{hint}</div>
      )}
    </div>
  );
}

export function ResultRow({ label, value, bold = false, indent = false, accent = "default" }) {
  const accentClasses = {
    default: "text-stone-100",
    positive: "text-[#5DB87A]",
    negative: "text-[#E07B5C]",
    muted: "text-stone-500",
  };
  return (
    <div className={`flex items-baseline justify-between py-1 ${indent ? "pl-3" : ""}`}>
      <span
        className={`text-[12.5px] ${
          bold ? "font-semibold text-stone-100" : "text-stone-400"
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
    <div className={`bg-[#141518] border border-[#2a2d33] rounded-sm ${className}`}>
      {(title || action) && (
        <div className="px-4 py-2.5 border-b border-[#2a2d33] flex items-center justify-between">
          {title && (
            <h3
              className="text-[13px] font-semibold text-stone-100 tracking-tight"
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
    default: "bg-[#1c1e22] text-stone-300 border-[#2a2d33]",
    success: "bg-[#5DB87A]/10 text-[#5DB87A] border-[#5DB87A]/30",
    warning: "bg-[#E5B568]/10 text-[#E5B568] border-[#E5B568]/30",
    danger: "bg-[#E07B5C]/10 text-[#E07B5C] border-[#E07B5C]/30",
    blue: "bg-[#2b8fe0]/15 text-[#4FA8F0] border-[#2b8fe0]/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-[0.06em] font-semibold border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
