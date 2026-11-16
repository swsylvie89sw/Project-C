# AI ROI Simulator

A browser-only web app for AI consultants: estimate AI API costs, then evaluate ROI and TCO before presenting a proposal. There is no backend; settings are kept in the browser's `localStorage`.

Live: https://swsylvie89sw.github.io/Project-C/

Scope is defined in [`scope.md`](scope.md); build rules are in [`CLAUDE.md`](CLAUDE.md).

## Development

Requires Node.js (LTS).

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm test` | Run the unit tests (Vitest) |
| `npm run build` | Production build into `dist/` |

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages. In the repository settings, Pages → Source must be set to **GitHub Actions**.

## Disclaimer

Results are estimates based on user-supplied assumptions and user-maintained prices. This is not financial advice.
