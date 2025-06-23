# Web Font Style Validation Framework

Automated Playwright-based framework to validate font-family styles for headers, body, and disclaimer text on webpages listed in a JSON file. Built with Node.js and JavaScript.

**Developer:** Ravikiran akula(Rakula) (ID: 3222)

## Overview

This framework automatically validates that web fonts across a list of URLs conform to the branding guidelines:

- Headers (`<h1>`, `<h2>`, `<h3>`) must use `Lato` font
- Subheaders (`<h4>`, `<h5>`, `<h6>`), body text (`.body-text`, `<p>`), and disclaimers (`.disclaimer`, `<small>`) must use `Inter` font

## Features

- ✅ Reads URLs from a JSON file
- ✅ Navigates to each URL using Playwright
- ✅ Extracts and validates font-family styles of HTML elements
- ✅ Provides both CSV and interactive HTML reports with timestamps
- ✅ Takes screenshots of each page for reference
- ✅ Handles errors gracefully with detailed logging

## Prerequisites

- Node.js (v14 or later)
- NPM or Yarn

## Installation

```bash
# Clone the repository (if applicable)
# cd to the project directory
npm install
```

## Usage

### 1. Prepare the URL List

Place your URLs in `data/urls.json` as a JSON array.

Example format:
```json
[
  "https://qawww.capella.edu/",
  "https://qawww.capella.edu/capella-experience/compare-learning-formats/"
]
```

### 2. Configure Environment Variables (Optional)

Edit the `.env` file to customize settings:

```properties
# Run browser in headless mode (true/false)
HEADLESS=true

# Page load timeout in milliseconds
TIMEOUT=60000

# Directory to save screenshots
SCREENSHOT_PATH=./reports/screenshots
```

### 3. Run the Validation

```bash
npm test
# or
npm run validate
```

### 4. View the Reports

After execution, reports will be available in:

- CSV Report: `reports/font-report-DDMMYYYY_HHMMSS.csv`
- HTML Report: `reports/font-report-DDMMYYYY_HHMMSS.html` (interactive with filtering options)
- Screenshots: `reports/screenshots/`

## Project Structure

```
web-font-validator/
├── tests/
│   └── font-validation.js     # Main test script (JavaScript)
├── data/
│   └── urls.json              # JSON file with URLs to test
├── utils/
│   ├── urlReader.js           # Utility for reading URLs from JSON (JavaScript)
│   └── fontChecker.js         # Logic for extracting and validating fonts (JavaScript)
├── reports/                   # Output reports (generated)
│   ├── font-report-*.csv      # CSV report with timestamp
│   ├── font-report-*.html     # Interactive HTML report with timestamp
│   └── screenshots/           # Screenshots of tested pages
├── playwright.config.js       # Playwright configuration (JavaScript)
├── .env                       # Environment settings
└── package.json               # Project dependencies and scripts
```

## Technical Details

- **Programming Language**: JavaScript (Node.js)
- **Testing Framework**: Playwright
- **Report Formats**: CSV and HTML with interactive filtering
- **Configuration**: Environment variables via dotenv

## Font Validation Rules

| Component Name   | HTML Elements               | Expected Font |
|------------------|------------------------------|----------------|
| Header           | `<h1>`, `<h2>`, `<h3>`       | `Lato`         |
| Subheader        | `<h4>`, `<h5>`, `<h6>`       | `Inter`        |
| Body Text        | `.body-text`, `<p>`          | `Inter`        |
| Disclaimer Text  | `.disclaimer`, `<small>`     | `Inter`        |

## Troubleshooting

- **Empty JSON File**: Ensure your JSON file contains at least one valid URL
- **Timeout Errors**: Increase the timeout value in `.env` file
- **Network Issues**: Check your internet connection or VPN settings
- **Browser Crashes**: Try setting `HEADLESS=false` to debug visually

## License

© 2025 Rakula (ID: 3222). All rights reserved.