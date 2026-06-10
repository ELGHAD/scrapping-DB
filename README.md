# scraping-DB

Small Node.js scraper that uses SerpApi to collect search results and save them to a local database and spreadsheet.

**Project**
- **Description:** A lightweight scraper + small web UI that runs queries via SerpApi, stores results, and exports to Excel/CSV.

**Prerequisites**
- **Node.js:** v14+ recommended.
- **SERPAPI key:** Obtain a key from SerpApi and set it as an environment variable `SERPAPI_API_KEY` or provide it via the app's configuration.

**Install**

```bash
npm install
```

**Configuration**
- Set your SerpApi API key in the environment:

```bash
# Windows (PowerShell)
$env:SERPAPI_API_KEY = "your_api_key_here"

# Linux / macOS
export SERPAPI_API_KEY="your_api_key_here"
```

**Usage**
- Run the scraper:

```bash
node scraper.js
```

- Start the small server / UI:

```bash
node server.js
```

Check `output/` for generated spreadsheets and JSON exports.

**Files & Structure**
- [scraper.js](scraper.js) — main scraper runner.
- [server.js](server.js) — minimal web UI server.
- [lib/args.js](lib/args.js) — argument parsing helpers.
- [lib/db.js](lib/db.js) — database helpers and storage.
- [lib/excel.js](lib/excel.js) — Excel/CSV export helpers.
- [lib/serpapi.js](lib/serpapi.js) — SerpApi wrapper and request handling.
- [output/](output/) — generated outputs (spreadsheets, exports).
- [public/](public/) — static assets used by the server UI.

**Troubleshooting**
- If requests fail, confirm `SERPAPI_API_KEY` is set and has quota.
- Network or rate-limit errors are logged to console — retry with backoff or reduce request rate.

**Contributing**
- Open issues or PRs. Keep changes small and document any new config options.

**License**
- MIT (or change to the license you prefer).
