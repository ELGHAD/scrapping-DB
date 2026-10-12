# Scraping DB — Search Data Collection and Export Tool

A lightweight Node.js application that retrieves search results through SerpApi, stores collected data locally, and exports datasets to spreadsheet and structured formats.

## Overview

Scraping DB provides a simple workflow for collecting search results and organizing them for further analysis. It combines API integration, local data persistence, command-line execution, and a minimal web interface.

The project uses a modular structure to separate search requests, database operations, argument parsing, and data export.

## Key Features

- **Search Data Collection:** Retrieve search results through the SerpApi API.
- **Local Data Storage:** Persist collected records using the project's database layer.
- **Spreadsheet Export:** Generate Excel and CSV files for further analysis.
- **JSON Export:** Save structured results as JSON.
- **Command-Line Execution:** Run collection tasks using Node.js.
- **Minimal Web Interface:** Access the lightweight server interface.
- **Modular Architecture:** Separate API communication, storage, argument parsing, and export logic.

## Technology Stack

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Language | JavaScript |
| Search Data Provider | SerpApi |
| Data Persistence | Local database layer |
| Export Formats | Excel, CSV, JSON |
| Interface | Lightweight web UI |
| Configuration | Environment variables |

The exact database engine and frontend libraries depend on the current implementation.

## Architecture

```text
User
 |
 +--------------------+
 |                    |
 v                    v
CLI Runner        Web Interface
 |                    |
 +----------+---------+
            |
            v
       Data Collection
            |
            v
        SerpApi API
            |
            v
    Search Result Processing
            |
            v
      Local Data Storage
            |
            v
      Export Generation
            |
       +----+----+
       |    |    |
      XLSX  CSV  JSON
```

## Project Structure

```text
scraping-DB/
├── scraper.js       # Main scraper runner
├── server.js        # Lightweight web server and UI
├── lib/
│   ├── args.js      # Command-line argument parsing
│   ├── db.js        # Database operations
│   ├── excel.js     # Spreadsheet and CSV exports
│   └── serpapi.js   # SerpApi integration
├── public/          # Static assets for the web interface
└── output/          # Generated data exports
```

## Getting Started

### Prerequisites

- Node.js and npm
- A SerpApi API key
- Any database setup required by the project's database implementation

### 1. Clone the repository

```bash
git clone https://github.com/ELGHAD/scraping-DB.git
cd scraping-DB
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API key

Set your SerpApi API key as an environment variable.

**Windows PowerShell**

```powershell
$env:SERPAPI_API_KEY = "your_api_key_here"
```

**Linux or macOS**

```bash
export SERPAPI_API_KEY="your_api_key_here"
```

Keep API keys private. Do not commit credentials to the repository.

### 4. Run the scraper

```bash
node scraper.js
```

### 5. Start the web interface

```bash
node server.js
```

Check the terminal output for the server address and inspect the `output/` directory for generated files.

## Error Handling and Troubleshooting

- **Authentication or API errors:** Verify that `SERPAPI_API_KEY` is set correctly and that your SerpApi account has available quota.
- **Network failures:** Check connectivity and retry transient failures.
- **Rate limits:** Reduce request frequency and use bounded retries with exponential backoff where appropriate.
- **Missing exports:** Check the output directory and verify that the application has permission to write files.
- **Database errors:** Confirm that the configured database is available and its settings match the implementation.

## Engineering Considerations

Potential improvements include:

- Input validation and clearer command-line options.
- Structured logging and more informative error messages.
- Retry policies and request throttling.
- Automated tests for API handling, persistence, and export generation.
- Database schema documentation and reproducible setup instructions.
- Configuration validation and secure handling of API credentials.

## Limitations

Search results depend on SerpApi availability, its response format, account limits, and the queries submitted. The project should not be described as directly scraping or integrating with every search engine or website unless those integrations are implemented explicitly.

## Author

**ELGHAD**

- GitHub: https://github.com/ELGHAD
- Portfolio: https://elghad.github.io/hamza-elrhadiouini-portfolio

## License

Add or retain a `LICENSE` file that matches the license you intend to distribute this project under. An MIT license should only be claimed if the repository actually includes that license.
