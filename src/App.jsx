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
      generatePDFReport({ inputs, results, leadDetails });
    } else {
      setPendingPdfDownload(true);
      setShowLeadModal(true);
    }
  };

  const handleLeadModalClose = (success) => {
    setShowLeadModal(false);
    if (success && pendingPdfDownload) {
      setTimeout(() => {
        setPendingPdfDownload(false);
      }, 200);
    } else {
      setPendingPdfDownload(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b]">
      {/* Header */}
      <header className="border-b border-[#2a2d33] bg-[#141518]">
        <div className="max-w-[1480px] mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img
              src="/ELITE_LOGO.png"
              alt="Elite Wealth Creators"
              className="w-14 h-14 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#4FA8F0] font-semibold mb-1">
                <span className="inline-block w-5 h-px bg-[#2b8fe0]" />
                Elite Wealth Creators
              </div>
              <h1
                className="text-[24px] md:text-[30px] leading-none text-stone-100"
                style={{
                  fontFamily: "Fraunces, serif",
                  fontWeight: 500,
                  fontVariationSettings: "'opsz' 144",
                  letterSpacing: "-0.02em",
                }}
              >
                SMSF Property Calculator
              </h1>
              <p className="text-[11.5px] text-stone-500 mt-1 italic">
                Your future built on property
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-stone-400 hover:text-stone-100 px-3 py-2 border border-[#2a2d33] rounded-sm hover:bg-[#1c1e22] hover:border-[#3a3d44] transition-colors font-medium"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-stone-300 hover:text-stone-100 px-3 py-2 border border-[#2a2d33] rounded-sm hover:bg-[#1c1e22] hover:border-[#3a3d44] transition-colors font-medium"
            >
              <Printer size={12} /> Print
            </button>
            <button
              onClick={handlePdfClick}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white bg-[#2b8fe0] hover:bg-[#4FA8F0] px-3 py-2 rounded-sm transition-colors font-semibold"
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

          <div className="bg-[#141518] border border-[#2a2d33] rounded-sm p-4 text-[11px] text-stone-400 leading-relaxed">
            <p className="font-semibold text-stone-200 mb-1.5 uppercase tracking-[0.08em] text-[10px]">
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
        onClose={(success) => handleLeadModalClose(success)}
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
