# SCOPE.md: AI ROI Simulator MVP

> Anything not on this list waits until after the demo.

**MVP proposition:** help AI consultants estimate AI implementation costs and evaluate the financial returns of AI projects before presenting proposals to clients.

**Build rules**
- P1 is built and verified before any P2 work starts.
- All math lives in pure, unit-tested functions (`src/engine/`, `src/lib/`). The UI contains no formulas.
- The existing manual fields always stay editable and always win over values filled by the guided panel.
- Every user-visible string goes through `t('key')` in both languages from the start.

---

## P1 MUST HAVE (AI cost estimation)

| # | Feature | Done when |
|---|---|---|
| 1 | **Use case definition** (name required, description optional) | Both appear on the results and summary |
| 2 | **Provider and model selection** from a configurable price table | Changing provider filters the model list |
| 3 | **Usage inputs:** monthly users, interactions per user per month, avg input tokens, avg output tokens | Non-negative numbers only; results update instantly |
| 4 | **Token and cost outputs:** monthly input tokens, monthly output tokens, input cost, output cost, total monthly cost, total annual cost | All six values are shown, with the formula displayed |
| 5 | **Model comparison** (2 to 4 models on identical usage) | Table shows monthly cost, annual cost and % difference vs the cheapest |
| 6 | **Manual price configuration** (edit input/output price per 1M tokens, reset to default) | Editing a price changes every dependent number; edits persist in the browser; table shows an "as of" date |
| 7 | **Display currency** (USD, TWD, EUR and others) with a **manual exchange rate** and "as of" date; prices stay in USD | Symbol and results change with the currency; no rate means a clear prompt, not a wrong number |

## Bilingual interface MUST HAVE

| # | Feature | Done when |
|---|---|---|
| 8 | **Top-left toggle "EN / 繁中"** switching all interface text | Every screen works in both languages without reloading |
| 9 | **Both dictionaries complete**, with a key-parity test | `en.ts` and `zhTW.ts` have identical keys; test fails otherwise |
| 10 | **Saved choice**, `<html lang>` updated, locale-aware number and currency formatting | Choice survives refresh; `en-US` / `zh-TW` formats |

## Guided estimate panel MUST HAVE (optional, collapsible, above the existing fields)

| # | Feature | Done when |
|---|---|---|
| 11 | **Step 1: parts of one request** (system prompt, user input, background context, expected response), each tagged Input or Output, tokens counted in the browser | Live count updates as the user types; context uses presets; response uses task-type presets |
| 12 | **Step 2: input and output shown separately**, with cost per request split | Input and output tokens and costs appear separately for the selected model |
| 13 | **Step 3: multiply by volume** (daily or monthly toggle) | Fills monthly users and interactions per user |
| 14 | **"Apply to estimator"** fills the existing four fields; filled fields show a "from guide" tag | Manual edits remove the tag and always win |
| 15 | **Content-language selector** (English or Traditional Chinese) for example prompts and words-vs-characters output length | Independent of the interface language |
| 16 | **Visible accuracy note** | "Estimated with a GPT tokenizer. Other providers may count differently. Your text stays in your browser." |

## P2 MUST HAVE (starts only after P1 works)

- One-time implementation cost; monthly infrastructure and maintenance
- AI operating cost reused from P1 (overridable)
- Current manual labor cost and productivity improvement %
- Monthly and annual TCO, annual benefit, net annual benefit, ROI %, payback period ("no payback at current assumptions" when it never pays back)

## SHOULD HAVE (only if time remains; cut in this order, last item first)

1. Guided panel Step 4, "compare with real usage": actual input tokens, output tokens and optional spend; shows variance and input/output correction factors; "Apply correction" works; factors persist
2. Audience view (Individual / Team / Enterprise) that changes the summary wording and extra figures only
3. Per-model `tokenAdjust` (default 1.0) for provider token-count differences
4. Average turns per conversation for the Chat task type
5. Safety buffer / overhead % on P1 cost
6. Save, duplicate and delete scenarios; print-friendly summary
7. Low / base / high scenarios for P2
8. Native-speaker review of the Traditional Chinese text
9. Default interface language from the browser setting

## OUT OF SCOPE

Authentication, payments, admin dashboard, backend or database, live price or exchange-rate feeds, provider token-count APIs, file or PDF upload, usage-history charts, additional languages, AI-assisted free-text intake, sharing links, analytics, mobile app, enterprise integrations.

---

## P1 formulas

- Monthly interactions = monthly users x interactions per user
- Monthly input tokens = monthly interactions x avg input tokens (x `tokenAdjust` per model, if enabled)
- Monthly output tokens = monthly interactions x avg output tokens
- Input cost = monthly input tokens / 1,000,000 x input price per 1M
- Output cost = monthly output tokens / 1,000,000 x output price per 1M
- Monthly AI cost = input cost + output cost
- Annual AI cost = monthly AI cost x 12
- Difference vs cheapest = (model cost - cheapest cost) / cheapest cost
- Displayed cost in another currency = USD cost x manual exchange rate

Round for display only, never inside calculations.

## Guided panel calculations (pure functions in `src/lib/`; the last three lines belong to Step 4, a SHOULD HAVE)

- Input tokens per request = system prompt + user input + background context
- Output tokens per request = expected response (words or characters converted to tokens by editable factors)
- Monthly users and interactions per user from daily volume: people x requests per person per day x days per month
- Input correction factor = actual input tokens / estimated input tokens
- Output correction factor = actual output tokens / estimated output tokens
- Cost variance = (actual spend - estimated spend) / estimated spend

Conversion factors (tokens per English word, tokens per Traditional Chinese character, output length presets, context presets) are starting assumptions kept in one config file, to be calibrated against real samples.

## Data fields

**models.json** (one row per model): `provider`, `model`, `inputPricePer1M`, `outputPricePer1M`, `priceAsOf`, `source` (official pricing page URL), optional `tokenAdjust`. Prices are filled by the user from official pricing pages.

**Usage input:** `monthlyUsers`, `interactionsPerUser`, `avgInputTokens`, `avgOutputTokens`.

**localStorage** (always in try/catch; the app must work without it): price overrides (`provider/model` to `{ inputPricePer1M, outputPricePer1M }`), display currency and exchange rates, interface language, and, if built, guide correction factors and saved scenarios.

## P1 acceptance checklist

- [ ] A first-time user completes a cost estimation without help, using the guided panel
- [ ] At least two models compare correctly with consistent totals
- [ ] Engine outputs match a hand-built spreadsheet for 3 scenarios
- [ ] Zero users, zero tokens and very large volumes produce no NaN or Infinity
- [ ] Price overrides persist after refresh; reset restores defaults
- [ ] Exchange-rate conversion matches a hand calculation; switching back to USD restores the original numbers
- [ ] Every screen works in English and Traditional Chinese; the choice survives a refresh; long Chinese text does not break the phone layout
- [ ] The guided panel fills the four fields; manual edits win; one English and one Traditional Chinese sample match the provider's official token counter within a documented tolerance
- [ ] The app works with storage unavailable
- [ ] If Step 4 is built: calibration factors persist and match a hand calculation
