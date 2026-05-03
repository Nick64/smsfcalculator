import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

export function LeadCaptureModal({ open, onClose, onSuccess, inputs, results, trigger = "pdf" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          consent,
          trigger,
          submittedAt: new Date().toISOString(),
          summary: {
            propertyPrice: inputs.propertyPrice,
            state: inputs.state,
            holdingYears: inputs.holdingYears,
            smsfStage: inputs.smsfStage,
            afterTaxProfit: results.afterTaxProfit,
            annualizedROI: results.annualizedROI,
            weeklyAfterTax: results.weeklyAfterTax,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Submission failed");
      }
      setStatus("success");
      const capturedDetails = { name: name.trim(), email: email.trim(), phone: phone.trim() };
      if (onSuccess) onSuccess(capturedDetails);
      // Auto-close after 1.5s on success
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Submission failed. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "submitting") onClose(false);
      }}
    >
      <div className="bg-white rounded-sm shadow-xl border border-stone-200 max-w-md w-full">
        <div className="flex items-start justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-emerald-900 font-semibold mb-0.5">
              Elite Wealth Creators
            </div>
            <h3
              className="text-[18px] text-stone-900 leading-tight"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
            >
              {trigger === "pdf"
                ? "Get your personalised report"
                : "Save your scenario"}
            </h3>
          </div>
          <button
            onClick={() => status !== "submitting" && onClose(false)}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="px-5 py-10 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-emerald-700 mb-3" strokeWidth={1.5} />
            <h4
              className="text-[20px] text-stone-900 mb-1"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
            >
              Thank you, {name.split(" ")[0]}
            </h4>
            <p className="text-[13px] text-stone-600 max-w-xs">
              Your report is being prepared. One of our SMSF specialists will be in
              touch within one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4">
            <p className="text-[12.5px] text-stone-600 mb-4 leading-relaxed">
              {trigger === "pdf"
                ? "Enter your details to download a branded PDF summary of this scenario. We'll also send a copy to your inbox."
                : "We'll save this scenario and email you a summary."}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-600 font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800/20"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-600 font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800/20"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.08em] text-stone-600 font-medium mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04xx xxx xxx"
                  className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800/20"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-emerald-800"
                />
                <span className="text-[11px] text-stone-600 leading-relaxed">
                  I agree to be contacted by Elite Wealth Creators about SMSF
                  property investment opportunities. We never share your details.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="mt-3 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-900 text-[11.5px] rounded-sm">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || !consent}
              className="w-full mt-5 bg-emerald-900 hover:bg-emerald-800 text-emerald-50 px-4 py-2.5 rounded-sm text-[12px] uppercase tracking-[0.06em] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>{trigger === "pdf" ? "Download PDF" : "Save Scenario"}</>
              )}
            </button>
            <p className="text-[10px] text-stone-400 text-center mt-2">
              By submitting you accept our terms. General information only — not advice.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
