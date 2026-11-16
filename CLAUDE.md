# CLAUDE.md: AI ROI Simulator

## What this project is
A browser-only web app (no backend) for AI consultants and non-experts: estimate AI API costs, then evaluate ROI and TCO before presenting a proposal. This is a 24-hour MVP. Be pragmatic: the smallest useful product, correct and explainable math before polish.

Read `scope.md` first. Anything not listed as MUST HAVE or SHOULD HAVE is out of scope; do not add it.

## Stack
Vite, React, TypeScript, Tailwind CSS, Vitest. Persistence: browser `localStorage` only (always in try/catch; the app must work without it). Hosted as a static site on GitHub Pages (https://swsylvie89sw.github.io/my_AI_ROI_sim/), so `vite.config.ts` needs `base: '/my_AI_ROI_sim/'`.

## Commands
- `npm run dev`: local dev server
- `npm test`: unit tests (Vitest)
- `npm run build`: production build into `dist/`

Run `npm run build` and `npm test` before every commit. Never commit with a failing build or test.

## Architecture rules
- All financial math lives in pure functions in `src/engine/` (`costEngine.ts`, `roiEngine.ts`). No React, no `localStorage`, no formatting inside the engine. The UI contains no formulas.
- Guide conversions and calibration math are pure functions in `src/lib/` and are unit tested.
- Model prices come from `src/data/models.json` (provider, model, inputPricePer1M, outputPricePer1M, priceAsOf, source, optional tokenAdjust). Prices are in USD. Never invent or "remember" prices: leave them for the user to fill from official pricing pages.
- Round for display only, never inside calculations. Guard against division by zero and NaN/Infinity.
- Every user-visible string goes through `t('key')` from `src/i18n/`. Two dictionaries: `en.ts` (source of truth) and `zhTW.ts` (Traditional Chinese, Taiwan wording, e.g. 快取 not 缓存). A test must fail if the key sets differ. Do not translate user-entered text or provider/model names.
- Existing manual input fields always stay editable and always win over values filled by the guided panel.

## Core formulas (P1)
- monthly interactions = monthly users x interactions per user
- monthly input tokens = interactions x avg input tokens x tokenAdjust
- monthly output tokens = interactions x avg output tokens
- input cost = input tokens / 1,000,000 x input price; output cost likewise
- monthly cost = input cost + output cost; annual = monthly x 12
- Non-USD display: prices x a manually entered exchange rate (with an "as of" date). No live rates.

## Core formulas (P2)
- monthly TCO = AI operating cost + infrastructure + maintenance
- year-1 TCO = one-time cost + annual TCO
- annual benefit = current manual labor cost (monthly) x 12 x productivity improvement %
- net annual benefit = annual benefit - annual TCO
- year-1 ROI % = (annual benefit - year-1 TCO) / year-1 TCO x 100
- payback months = one-time cost / monthly net benefit, only if monthly net benefit > 0; otherwise show "no payback at current assumptions"

## Guided estimate panel (above the existing fields, optional and collapsible)
Three MUST HAVE steps: (1) list the parts of one request (system prompt, user input, background context, expected response), each tagged Input or Output, tokens counted in the browser with `gpt-tokenizer` (lazy-loaded, input capped at 200,000 characters); (2) input and output shown separately; (3) multiply by daily or monthly volume. Step 4 (compare with actual usage from the provider dashboard and apply correction factors) is a SHOULD HAVE: build it only after everything else passes. The panel fills the existing fields. Always show: "Estimated with a GPT tokenizer. Other providers may count differently. Your text stays in your browser."

## Language
Top-left toggle "EN | 繁中". Interface language is separate from the guided panel's content language (which controls example prompts and words-vs-characters for output length). Persist the choice, set `<html lang>` to `en` or `zh-Hant-TW`, format numbers and currency with `en-US` / `zh-TW`, and use a font stack that covers Traditional Chinese.

## Out of scope (do not build)
Authentication, payments, admin dashboard, backend or database, live price or exchange-rate feeds, provider token-count APIs, file upload, usage-history charts, additional languages, analytics, enterprise integrations.

## Build order (one milestone at a time; commit after each)
1. Verify the scaffold: build and tests pass; `base` set for GitHub Pages; deployed page loads.
2. P1 `costEngine.ts` with `tokenAdjust` and unit tests. Check results against the worked example in `scope.md` / a spreadsheet.
3. i18n scaffolding plus the language toggle, then the P1 interface (form, results with visible formulas, model comparison of 2 to 4 models, price editor, currency selector with manual rate) using `t()` from the start.
4. Guided estimate panel (steps 1 to 3) and tokenizer, with tests for the conversion functions. Step 4 and its calibration functions wait until the SHOULD HAVE stage.
5. P2 `roiEngine.ts` with unit tests (include the no-payback and zero cases).
6. P2 interface and the P1 to P2 hand-off (reuse the AI operating cost, overridable); save/load scenarios.
7. Responsive polish, testing checklist, production deploy, demo scenario.

## Working style
- Before coding a milestone, state a short plan and list the files you will touch. Keep changes small and focused.
- If something is ambiguous or the scope seems to grow, stop and ask instead of guessing.
- Do not add dependencies beyond those named here without asking.
- After each milestone, report: what changed, test and build output, and anything left undone.
