# SMSF Investment Property Calculator 

An online lifecycle calculator for property held inside a Self Managed Super Fund (SMSF), built for **Elite Wealth Creators**. Models cash flow, tax, capital gain, and after-tax ROI year-by-year — with state-based stamp duty, P&I or interest-only loans, scenario comparison, branded PDF export, and lead capture.

Deploys as a single Cloudflare Pages site with one Pages Function for lead capture.

---

## What's inside

- **Vite + React + Tailwind** front-end (no Next.js — keeps the bundle small and the deploy trivial)
- **8-state stamp duty engine** (NSW, VIC, QLD, WA, SA, TAS, ACT, NT) — verified against each state revenue office for FY 2025-26
- **Year-by-year projection** with rent growth, expense inflation, and compounding capital growth
- **Loan modes**: interest-only (typical for SMSF) and full P&I with proper amortization schedule
- **CGT calculation** for both pension (0%) and accumulation (1/3 discount) phases
- **Concessional cap warning** when SGC + salary sacrifice exceeds $30k
- **Scenario save / load / compare** (up to 6 saved per browser, side-by-side comparison table)
- **Branded PDF export** via jsPDF + html2canvas
- **Lead capture** posts to a Cloudflare Pages Function that stores in KV and optionally forwards to a webhook

---

## Local development

```bash
npm install
npm run dev
```

Opens on http://localhost:5173. Hot reload is on.

To preview a production build locally:

```bash
npm run build
npm run preview
```

---

## Deployment to Cloudflare Pages

You have three options. **Pick one.**

### Option 1 — Wrangler CLI (fastest)

```bash
npm install
npm run build
npx wrangler login              # one-time, opens browser
npx wrangler pages deploy dist --project-name=smsf-calculator
```

Wrangler will create the project on first deploy and give you a `*.pages.dev` URL. Subsequent deploys reuse the project.

### Option 2 — Connect a Git repository (recommended for production)

1. Push this folder to GitHub / GitLab.
2. In the Cloudflare dashboard go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo. Use these build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: leave blank
4. Save and deploy. Every push to `main` triggers a new deploy automatically.

### Option 3 — Drag-and-drop

Run `npm run build`, then drag the `dist/` folder onto the Cloudflare Pages dashboard. Functions are **not** uploaded this way — use option 1 or 2 if you need lead capture.

---

## Configuring lead capture

The form posts to `/api/leads`, which is implemented in `functions/api/leads.js`. By default it accepts the submission and returns success — but to actually **store** or **notify** you, configure one or both of:

### A) Cloudflare KV (built-in storage)

```bash
npx wrangler kv:namespace create LEADS
```

Wrangler will print:

```
[[kv_namespaces]]
binding = "LEADS"
id = "abc123def456..."
```

Either:

- **Paste those lines into `wrangler.toml`** (uncomment the existing block), then redeploy. Or:
- In the Cloudflare dashboard, go to **Workers & Pages → smsf-calculator → Settings → Functions → KV namespace bindings**, and add a binding with name `LEADS` pointing at the namespace.

Leads are stored under two keys for retrieval:

- `lead:{uuid}` — full payload
- `date:{YYYY-MM-DD}:{uuid}` — index

To list recent leads from the dashboard: **Storage → KV → smsf-calculator-LEADS** and filter by `date:`. Or query with `wrangler kv:key list --binding=LEADS`.

### B) Webhook forwarding (Zapier / Make / HubSpot / n8n)

In the Cloudflare dashboard: **Workers & Pages → smsf-calculator → Settings → Environment variables → Add variable**:

- Variable name: `LEAD_WEBHOOK_URL`
- Value: `https://hooks.zapier.com/hooks/catch/...` (or your endpoint)
- Environment: Production (and/or Preview)

Save. The next deploy picks it up. Each lead is POSTed as JSON:

```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0412345678",
  "consent": true,
  "trigger": "pdf",
  "summary": { "propertyPrice": 800000, "state": "NSW", "afterTaxProfit": 245000, "..." : "..." },
  "submittedAt": "2026-...",
  "receivedAt": "2026-...",
  "userAgent": "...",
  "ip": "...",
  "country": "AU"
}
```

From Zapier you can route to: Gmail, HubSpot CRM, Pipedrive, Google Sheets, Slack, etc.

You can configure **both** KV and webhook — KV is the persistent backup, webhook does the live notification.

### C) Direct email (advanced)

If you want the function itself to send an email rather than going through a webhook, you'll need a transactional email provider (Resend, Postmark, SendGrid). Add the API key as a Cloudflare environment variable, then add a `fetch` call in `functions/api/leads.js`. (MailChannels — formerly free for Workers — is no longer freely available.)

---

## Customising the calculator

### Brand colours

`tailwind.config.js` defines the EWC palette:

```js
colors: {
  ewc: {
    forest: "#1F4232",  // primary
    sand:   "#F7F4EE",  // background
    gold:   "#B8924A",  // accent
    rust:   "#A04830",  // negative / warning
    ink:    "#1A1F1B",  // text
  },
}
```

Change these and rebuild. The PDF export also reads matching hex values from `src/lib/pdfExport.js` — update them in both places if you change the palette.

### Default inputs

`src/lib/defaults.js` is the single source of truth for the example scenario shown when the page loads. Tune to match your typical client's starting point.

### Stamp duty rates

`src/lib/stampDuty.js` contains the marginal-rate brackets for each state, sourced from each state revenue office. Verify annually around 1 July when state budgets land. The structure is straightforward — each state has either `brackets` (marginal-rate array), `flatBrackets` (full-rate ranges, used by VIC's $960k–$2M bracket), or a `formula: true` flag for NT.

### Concessional cap

Hard-coded at `$30,000` in `src/lib/calculator.js` (constant `CONCESSIONAL_CAP`). Update annually if indexed.

### Adding fields

Add the field to `DEFAULT_INPUTS` in `defaults.js`, render it inside the relevant `<Section>` in `InputsPanel.jsx`, and consume it in `calculator.js`. The result keys flow through to `ResultsPanel.jsx` automatically.

---

## Architecture notes

```
smsf-calc/
├── src/
│   ├── App.jsx              # top-level: state, modals, layout
│   ├── lib/
│   │   ├── calculator.js    # calculation engine
│   │   ├── stampDuty.js     # state-based duty rates
│   │   ├── loanAmortization.js  # P&I / I/O schedules
│   │   ├── scenarios.js     # localStorage helpers
│   │   ├── pdfExport.js     # branded PDF generator
│   │   ├── formatters.js    # currency / percent helpers
│   │   └── defaults.js      # default inputs
│   └── components/
│       ├── primitives.jsx   # Field, Section, KPICard, etc.
│       ├── InputsPanel.jsx  # left sidebar accordion
│       ├── ResultsPanel.jsx # KPIs, charts, projections
│       ├── ScenarioBar.jsx  # save/load/compare scenarios
│       └── LeadCaptureModal.jsx
├── functions/
│   └── api/
│       └── leads.js         # Cloudflare Pages Function
├── public/
│   └── favicon.svg
├── wrangler.toml            # Cloudflare config + KV binding
├── vite.config.js           # Vite + chunk splitting
├── tailwind.config.js       # EWC brand tokens
└── package.json
```

The project is intentionally **single-tenant**: scenarios live in `localStorage` per browser, lead capture is per-deployment. If you need multi-user accounts, swap `scenarios.js` for an authenticated D1 table.

---

## Important caveats

- **Stamp duty estimates** use standard residential investor brackets. SMSF purchases via a Limited Recourse Borrowing Arrangement (LRBA) typically attract the same rate, but **bare trust nominee structures** may have unique rules in some states. Always confirm with a conveyancer.
- **CGT treatment** assumes pension assets are 100% supporting current pension liabilities. Reality is often more nuanced.
- **Concessional cap** is the 2024-25 figure ($30k) — verify annually against ATO indexation.
- **Borrowing expense** deductions are spread over 5 years per ATO standard.
- **Year-1 cash flow figures** were verified against the source spreadsheet to the cent on the original example inputs.

The footer disclaimer is rendered on every PDF export and visible at the bottom of the page. Don't remove it.

---

## License & ownership

Built for Elite Wealth Creators. Internal commercial use only.
