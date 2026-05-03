import { useState, useMemo, useEffect } from "react";
import { Printer, RotateCcw, Download } from "lucide-react";
import { calculate } from "./lib/calculator";
import { calculateStampDuty } from "./lib/stampDuty";
import { DEFAULT_INPUTS } from "./lib/defaults";
import {
  loadScenarios,
  addScenario,
  deleteScenario,
} from "./lib/scenarios";
import { generatePDFReport } from "./lib/pdfExport";
import { InputsPanel } from "./components/InputsPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import {
  ScenarioBar,
  ScenarioCompareModal,
} from "./components/ScenarioBar";
import { LeadCaptureModal } from "./components/LeadCaptureModal";

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [scenarios, setScenarios] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [pendingPdfDownload, setPendingPdfDownload] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);

  const computedStampDuty = useMemo(
    () => calculateStampDuty(inputs.state, inputs.propertyPrice),
    [inputs.state, inputs.propertyPrice],
  );

  const results = useMemo(() => calculate(inputs), [inputs]);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const handleSaveScenario = (name) => {
    addScenario(name, inputs);
    setScenarios(loadScenarios());
  };

  const handleLoadScenario = (scenario) => {
    setInputs(scenario.inputs);
    setShowCompare(false);
  };

  const handleDeleteScenario = (id) => {
    deleteScenario(id);
    setScenarios(loadScenarios());
  };

  const handleReset = () => setInputs(DEFAULT_INPUTS);

  const handlePdfClick = () => {
    if (leadDetails) {
      // Already captured details this session
      generatePDFReport({ inputs, results, leadDetails });
    } else {
      setPendingPdfDownload(true);
      setShowLeadModal(true);
    }
  };

  const handleLeadModalClose = (success) => {
    setShowLeadModal(false);
    if (success && pendingPdfDownload) {
      // The lead form sets `leadDetails` via callback below
      setTimeout(() => {
        setPendingPdfDownload(false);
      }, 200);
    } else {
      setPendingPdfDownload(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header className="border-b border-stone-300 bg-stone-50/40">
        <div className="max-w-[1480px] mx-auto px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-900 font-semibold mb-1.5">
              <span className="inline-block w-5 h-px bg-emerald-900" />
              Elite Wealth Creators
            </div>
            <h1
              className="text-[28px] md:text-[34px] leading-none text-stone-900"
              style={{
                fontFamily: "Fraunces, serif",
                fontWeight: 500,
                fontVariationSettings: "'opsz' 144",
                letterSpacing: "-0.02em",
              }}
            >
              SMSF Property Calculator
            </h1>
            <p className="text-[12.5px] text-stone-600 mt-1.5 max-w-xl leading-relaxed">
              Project the full lifecycle economics of holding investment property inside
              a Self Managed Super Fund — cash flow, tax, capital gain, and after-tax ROI.
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-stone-600 hover:text-stone-900 px-3 py-2 border border-stone-300 rounded-sm hover:bg-white transition-colors font-medium"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-stone-700 hover:text-stone-900 px-3 py-2 border border-stone-300 rounded-sm hover:bg-white transition-colors font-medium"
            >
              <Printer size={12} /> Print
            </button>
            <button
              onClick={handlePdfClick}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-stone-50 bg-emerald-900 hover:bg-emerald-800 px-3 py-2 rounded-sm transition-colors font-medium"
            >
              <Download size={12} /> Download PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1480px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <aside className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <InputsPanel
            inputs={inputs}
            setInputs={setInputs}
            computedStampDuty={computedStampDuty}
          />
        </aside>

        <section className="space-y-5">
          <ScenarioBar
            scenarios={scenarios}
            currentInputs={inputs}
            onSave={handleSaveScenario}
            onLoad={handleLoadScenario}
            onDelete={handleDeleteScenario}
            onOpenCompare={() => setShowCompare(true)}
          />

          <ResultsPanel inputs={inputs} results={results} />

          {/* Disclaimer */}
          <div className="bg-stone-100/70 border border-stone-200 rounded-sm p-4 text-[11px] text-stone-600 leading-relaxed">
            <p className="font-semibold text-stone-800 mb-1.5 uppercase tracking-[0.08em] text-[10px]">
              Important disclaimer
            </p>
            <p>
              This calculator is provided for educational and illustrative purposes only and
              does not constitute financial, tax or legal advice. Outputs are estimates based
              on user-supplied assumptions and current general tax rules. SMSF property
              investment involves complex compliance requirements (LRBA, sole purpose test,
              in-house asset rules, related party transactions). Stamp duty figures are
              estimates based on standard residential investor brackets — bare trust
              structures may attract different rates. Always consult a licensed financial
              adviser, SMSF specialist accountant and conveyancer before making investment
              decisions.
            </p>
          </div>
        </section>
      </main>

      {showCompare && (
        <ScenarioCompareModal
          scenarios={scenarios}
          onClose={() => setShowCompare(false)}
          onLoad={handleLoadScenario}
        />
      )}

      <LeadCaptureModal
        open={showLeadModal}
        trigger={pendingPdfDownload ? "pdf" : "save"}
        inputs={inputs}
        results={results}
        onClose={(success) => {
          handleLeadModalClose(success);
          if (success && pendingPdfDownload) {
            // Trigger PDF download after modal closes
            // Get the form details from the modal's last submission via window event
            // (simpler: the modal could pass details up, but for now we use a single field)
          }
        }}
        onSuccess={(details) => {
          setLeadDetails(details);
          if (pendingPdfDownload) {
            generatePDFReport({ inputs, results, leadDetails: details });
          }
        }}
      />
    </div>
  );
}
