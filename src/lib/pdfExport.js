import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fmtCurrency, fmtCurrencyShort, fmtPct } from "./formatters";

/**
 * Generate a branded PDF report for the current scenario.
 *
 * Approach: render an off-screen HTML node with the report layout,
 * capture it with html2canvas, then page-split into a PDF.
 */
export async function generatePDFReport({ inputs, results, leadDetails }) {
  // Create off-screen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "0";
  container.style.width = "794px"; // A4 width at 96dpi
  container.style.padding = "40px";
  container.style.backgroundColor = "#FFFFFF";
  container.style.fontFamily = "Manrope, system-ui, sans-serif";
  container.style.color = "#1A1F1B";
  container.innerHTML = buildReportHTML({ inputs, results, leadDetails });
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFFFFF",
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    // PDF setup
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Page-split if taller than one page
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = `EWC-SMSF-Property-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

function buildReportHTML({ inputs, results, leadDetails }) {
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cashFlowIsNegative = results.afterTaxCashFlow < 0;

  return `
    <div style="font-family: 'Manrope', sans-serif; color: #1A1F1B;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #1F4232; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #1F4232; font-weight: 600; margin-bottom: 4px;">
            Elite Wealth Creators
          </div>
          <h1 style="font-family: 'Fraunces', serif; font-size: 28px; font-weight: 500; margin: 0; color: #1A1F1B; line-height: 1;">
            SMSF Property Investment Report
          </h1>
        </div>
        <div style="text-align: right; font-size: 11px; color: #6B6F6A;">
          <div>${today}</div>
          ${leadDetails && leadDetails.name ? `<div style="font-weight: 600; color: #1A1F1B; margin-top: 2px;">Prepared for ${leadDetails.name}</div>` : ""}
        </div>
      </div>

      <!-- Property summary -->
      <div style="background: #F7F4EE; padding: 16px; margin-bottom: 24px; border-radius: 2px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #6B6F6A; font-weight: 600; margin-bottom: 6px;">
          Property
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-size: 12px;">
          <div>
            <div style="color: #6B6F6A; margin-bottom: 2px;">Price</div>
            <div style="font-weight: 600; font-size: 14px;">${fmtCurrency(inputs.propertyPrice)}</div>
          </div>
          <div>
            <div style="color: #6B6F6A; margin-bottom: 2px;">Location</div>
            <div style="font-weight: 600; font-size: 14px;">${inputs.state}</div>
          </div>
          <div>
            <div style="color: #6B6F6A; margin-bottom: 2px;">Holding period</div>
            <div style="font-weight: 600; font-size: 14px;">${inputs.holdingYears} years</div>
          </div>
          <div>
            <div style="color: #6B6F6A; margin-bottom: 2px;">SMSF stage</div>
            <div style="font-weight: 600; font-size: 14px;">${inputs.smsfStage}</div>
          </div>
        </div>
      </div>

      <!-- Headline KPIs -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        ${kpiCardHTML("Initial Cash", fmtCurrencyShort(results.initialCashOutlay), `LVR ${fmtPct(results.lvr, 1)}`)}
        ${kpiCardHTML("Weekly " + (cashFlowIsNegative ? "Out-of-Pocket" : "Surplus"), fmtCurrency(Math.abs(results.weeklyAfterTax), 2), cashFlowIsNegative ? "Negative gearing" : "Positive geared", cashFlowIsNegative ? "#A04830" : "#1F4232")}
        ${kpiCardHTML("After-tax Profit", fmtCurrencyShort(results.afterTaxProfit), `Sale ${fmtCurrencyShort(results.propertySoldPrice)}`, results.afterTaxProfit > 0 ? "#1F4232" : "#A04830")}
        ${kpiCardHTML("Annualised ROI", fmtPct(results.annualizedROI, 1), `Total ${fmtPct(results.roiOnCash, 1)}`, "#B8924A")}
      </div>

      <!-- Year 1 cash flow -->
      ${sectionHTML(
        "Year 1 cash flow",
        `
        ${rowHTML("Annual rental income", fmtCurrency(results.annualRental))}
        ${rowHTML("Total annual outgoings", "−" + fmtCurrency(results.totalCashOutgoings))}
        ${rowHTML("Pre-tax cash flow", fmtCurrency(results.preTaxRealCashFlow), results.preTaxRealCashFlow >= 0 ? "positive" : "negative")}
        ${rowHTML("Annual tax savings", fmtCurrency(results.annualTaxSavings), "positive")}
        ${rowHTML("After-tax cash flow", fmtCurrency(results.afterTaxCashFlow), results.afterTaxCashFlow >= 0 ? "positive" : "negative", true)}
        ${rowHTML("Gross rental yield", fmtPct(results.grossRentalYield), "muted")}
        ${rowHTML("Net yield (after interest)", fmtPct(results.netYieldAfterInterest), "muted")}
        `,
      )}

      <!-- Capital Gain -->
      ${sectionHTML(
        "Capital gain & after-tax profit",
        `
        ${rowHTML("Property sold price", fmtCurrency(results.propertySoldPrice))}
        ${rowHTML("Property cost base", fmtCurrency(results.propertyCostBase), "muted")}
        ${rowHTML("Gross gain", fmtCurrency(results.grossGain), results.grossGain > 0 ? "positive" : "negative", true)}
        ${rowHTML("Capital gain tax", fmtCurrency(results.capitalGainTax), results.capitalGainTax > 0 ? "negative" : "muted")}
        ${rowHTML("Net cash flow over period", fmtCurrency(results.netCashFlowOverYears), results.netCashFlowOverYears >= 0 ? "positive" : "negative")}
        ${rowHTML("Total after-tax profit", fmtCurrency(results.afterTaxProfit), results.afterTaxProfit > 0 ? "positive" : "negative", true)}
        ${rowHTML("ROI on cash invested", fmtPct(results.roiOnCash, 1))}
        ${rowHTML("Annualised ROI", fmtPct(results.annualizedROI, 1), "positive", true)}
        `,
      )}

      <!-- Year-by-year table -->
      <div style="margin-bottom: 24px;">
        <div style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #1A1F1B;">
          Year-by-year projection
        </div>
        <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #1F4232;">
              <th style="text-align: left; padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #6B6F6A; font-size: 9px;">Year</th>
              <th style="text-align: right; padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #6B6F6A; font-size: 9px;">Property</th>
              <th style="text-align: right; padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #6B6F6A; font-size: 9px;">Gross Rent</th>
              <th style="text-align: right; padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #6B6F6A; font-size: 9px;">Outgoings</th>
              <th style="text-align: right; padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #6B6F6A; font-size: 9px;">After-tax CF</th>
              <th style="text-align: right; padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #6B6F6A; font-size: 9px;">Equity</th>
            </tr>
          </thead>
          <tbody>
            ${results.projection
              .map(
                (y) => `
              <tr style="border-bottom: 1px solid #E7E2D6;">
                <td style="padding: 5px 4px; font-weight: 600;">Y${y.year}</td>
                <td style="text-align: right; padding: 5px 4px;">${fmtCurrency(y.propValue)}</td>
                <td style="text-align: right; padding: 5px 4px;">${fmtCurrency(y.grossRent)}</td>
                <td style="text-align: right; padding: 5px 4px; color: #6B6F6A;">${fmtCurrency(y.outgoings)}</td>
                <td style="text-align: right; padding: 5px 4px; font-weight: 600; color: ${y.afterTaxCF >= 0 ? "#1F4232" : "#A04830"};">${fmtCurrency(y.afterTaxCF)}</td>
                <td style="text-align: right; padding: 5px 4px; font-weight: 600; color: #B8924A;">${fmtCurrency(y.equity)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Disclaimer -->
      <div style="border-top: 1px solid #D6D1C4; padding-top: 12px; margin-top: 16px; font-size: 9px; color: #6B6F6A; line-height: 1.5;">
        <div style="font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #1A1F1B; margin-bottom: 4px;">
          Important Disclaimer
        </div>
        <p style="margin: 0;">
          This report is provided for educational and illustrative purposes only and does not constitute financial, tax or legal advice. Outputs are estimates based on user-supplied assumptions and current general tax rules at the date of preparation. SMSF property investment involves complex compliance requirements (LRBA, sole purpose test, in-house asset rules, related party transactions). Always consult a licensed financial adviser, SMSF specialist accountant and conveyancer before making investment decisions. Stamp duty figures are estimates based on standard residential investor brackets and may not reflect concessions, surcharges or specific bare trust treatments.
        </p>
        <p style="margin-top: 8px; text-align: center; color: #1F4232; font-weight: 600;">
          Elite Wealth Creators · Australian SMSF Property Specialists · elitewealthcreators.com
        </p>
      </div>
    </div>
  `;
}

function kpiCardHTML(label, value, sub, accentColor = "#1A1F1B") {
  return `
    <div style="border: 1px solid #D6D1C4; padding: 12px; border-radius: 2px;">
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #6B6F6A; font-weight: 600; margin-bottom: 6px;">${label}</div>
      <div style="font-family: 'Fraunces', serif; font-size: 22px; font-weight: 500; color: ${accentColor}; line-height: 1; margin-bottom: 4px;">${value}</div>
      <div style="font-size: 10px; color: #6B6F6A;">${sub}</div>
    </div>
  `;
}

function sectionHTML(title, body) {
  return `
    <div style="margin-bottom: 20px;">
      <div style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #1A1F1B; padding-bottom: 4px; border-bottom: 1px solid #D6D1C4;">${title}</div>
      ${body}
    </div>
  `;
}

function rowHTML(label, value, accent = "default", bold = false) {
  const colors = {
    default: "#1A1F1B",
    positive: "#1F4232",
    negative: "#A04830",
    muted: "#6B6F6A",
  };
  const weight = bold ? "600" : "400";
  return `
    <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11.5px; border-bottom: 1px solid #F7F4EE;">
      <span style="color: ${bold ? "#1A1F1B" : "#6B6F6A"}; font-weight: ${weight};">${label}</span>
      <span style="color: ${colors[accent]}; font-weight: ${weight}; font-variant-numeric: tabular-nums;">${value}</span>
    </div>
  `;
}
