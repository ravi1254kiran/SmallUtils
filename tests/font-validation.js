/**
 * Web Font Style Validation Framework
 * Developer: Rakula (ID: 3222)
 * Created: June 2025
 */

const { readUrlsFromJson } = require('../utils/urlReader');
const { extractFontsFromPage } = require('../utils/fontChecker');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
require('dotenv').config();

// Function to generate timestamp for reports
function getDateTimeStamp() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}${month}${year}_${hours}${minutes}${seconds}`;
}

// Constants and configuration
const JSON_PATH = path.join(__dirname, '../data/urls.json');
const dateTimeStamp = getDateTimeStamp();
const REPORT_PATH = path.join(__dirname, `../reports/font-report-${dateTimeStamp}.csv`);
const HTML_REPORT_PATH = path.join(__dirname, `../reports/font-report-${dateTimeStamp}.html`);
const SCREENSHOT_DIR = process.env.SCREENSHOT_PATH || path.join(__dirname, '../reports/screenshots');
const TIMEOUT = parseInt(process.env.TIMEOUT || '60000');
const HEADLESS = process.env.HEADLESS !== 'false';

// Helper function to convert an object to a CSV row
function toCsvRow(obj) {
  return [
    obj.url,
    obj.component,
    obj.tag,
    obj.selector,
    obj.expected,
    obj.actual,
    obj.text, // Added text content column
    obj.status
  ].map(x => `"${(x||'').replace(/"/g, '""')}"`).join(',');
}

// Generate HTML report
function generateHtmlReport(results) {
  const failCount = results.filter(r => r.status.includes('❌')).length;
  const passCount = results.filter(r => r.status.includes('✅')).length;
  
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Font Validation Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #333; }
      .summary { margin: 20px 0; background: #f5f5f5; padding: 15px; border-radius: 5px; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      tr:hover { background-color: #f1f1f1; }
      .pass { color: green; }
      .fail { color: red; }
      .filters { margin: 20px 0; }
      button { padding: 8px 15px; margin-right: 10px; cursor: pointer; }
      select { padding: 8px; margin-right: 10px; }
      .filter-section { margin-bottom: 15px; }
      .filter-section label { font-weight: bold; margin-right: 10px; }
    </style>
  </head>
  <body>
    <h1>Web Font Validation Report</h1>
    <div class="Overall summary">
      <h2>Summary</h2>
      <p>Total Tests: ${results.length}</p>
      <p>Passed: ${passCount}</p>
      <p>Failed: ${failCount}</p>
      <p>Success Rate: ${((passCount / results.length) * 100).toFixed(2)}%</p>
    </div>
    <div class="filters">
      <div class="filter-section">
        <label for="statusFilter">Filter by Status:</label>
        <button onclick="filterByStatus('all')">Show All</button>
        <button onclick="filterByStatus('pass')">Show Passed Only</button>
        <button onclick="filterByStatus('fail')">Show Failed Only</button>
      </div>
      <div class="filter-section">
        <label for="urlFilter">Filter by URL:</label>
        <select id="urlFilter" onchange="filterByUrl(this.value)">
          <option value="all">All URLs</option>
          ${[...new Set(results.map(r => r.url))].map(url => 
            `<option value="${url}">${url}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    <table id="resultsTable">
      <thead>
        <tr>
          <th>URL</th>
          <th>Component</th>
          <th>Element</th>
          <th>Selector</th>
          <th>Expected Font</th>
          <th>Actual Font</th>
          <th>Content</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  results.forEach(result => {
    const statusClass = result.status.includes('✅') ? 'pass' : 'fail';
    html += `
      <tr class="${statusClass}">
        <td><a href="${result.url}" target="_blank">${result.url}</a></td>
        <td>${result.component}</td>
        <td>${result.tag}</td>
        <td>${result.selector}</td>
        <td>${result.expected}</td>
        <td>${result.actual}</td>
        <td>${result.text ? result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '') : ''}</td>
        <td class="${statusClass}">${result.status}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <script>
      // Track current filters
      let currentStatusFilter = 'all';
      let currentUrlFilter = 'all';

      // Filter by status
      function filterByStatus(filter) {
        currentStatusFilter = filter;
        applyFilters();
      }

      // Filter by URL
      function filterByUrl(url) {
        currentUrlFilter = url;
        applyFilters();
      }

      // Apply both filters together
      function applyFilters() {
        const rows = document.querySelectorAll('#resultsTable tbody tr');
        rows.forEach(row => {
          // Get URL from the first cell
          const rowUrl = row.cells[0].querySelector('a').href;
          const isMatchingUrl = currentUrlFilter === 'all' || rowUrl === currentUrlFilter;
          const isMatchingStatus = currentStatusFilter === 'all' || 
                                  (currentStatusFilter === 'pass' && row.classList.contains('pass')) ||
                                  (currentStatusFilter === 'fail' && row.classList.contains('fail'));
          
          // Show only if both filters match
          row.style.display = (isMatchingUrl && isMatchingStatus) ? '' : 'none';
        });
      }
    </script>
  </body>
  </html>
  `;

  return html;
}

// Main execution function
(async () => {
  console.log('Web Font Validation Framework - Starting');
  
  try {
    // Create directories if they don't exist
    if (!fs.existsSync(path.dirname(REPORT_PATH))) {
      fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    }
    
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    
    // Read URLs from JSON
    const urls = await readUrlsFromJson(JSON_PATH);
    if (urls.length === 0) {
      throw new Error('No URLs found in the JSON file');
    }
    
    console.log(`Starting validation for ${urls.length} URLs`);
    
    // Launch browser
    const browser = await chromium.launch({ 
      headless: HEADLESS 
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    const allResults = [];
    
    // Start with CSV header
    const rows = [
      'URL,Component Name,Element,Selector,Expected Font,Actual Font,Content,Status'
    ];
    
    // Process each URL
    for (const url of urls) {
      console.log(`Processing URL: ${url}`);
      
      try {
        // Navigate to URL with timeout
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: TIMEOUT
        });
        
        // Take a screenshot
        const urlSafe = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        await page.screenshot({ 
          path: path.join(SCREENSHOT_DIR, `${urlSafe}.png`),
          fullPage: false 
        });
        
        // Extract and validate fonts
        const results = await extractFontsFromPage(page);
        console.log(`Found ${results.length} elements to validate on ${url}`);
        
        // Add URL to each result and save
        const urlResults = results.map(r => ({ ...r, url }));
        allResults.push(...urlResults);
        
        // Add to CSV
        for (const r of urlResults) {
          rows.push(toCsvRow(r));
        }
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error.message);
        rows.push(toCsvRow({
          url,
          component: 'ERROR',
          tag: 'ERROR',
          selector: 'ERROR',
          expected: 'ERROR',
          actual: error.message,
          text: 'Error loading page',
          status: '❌ Failed'
        }));
        allResults.push({
          url,
          component: 'ERROR',
          tag: 'ERROR',
          selector: 'ERROR',
          expected: 'ERROR',
          actual: error.message,
          text: 'Error loading page',
          status: '❌ Failed'
        });
      }
    }
    
    // Close browser
    await browser.close();
    
    // Write reports
    fs.writeFileSync(REPORT_PATH, rows.join('\n'), 'utf8');
    fs.writeFileSync(HTML_REPORT_PATH, generateHtmlReport(allResults), 'utf8');
    
    // Print summary
    const failCount = allResults.filter(r => r.status.includes('❌')).length;
    const passCount = allResults.filter(r => r.status.includes('✅')).length;
    
    console.log('\n========== VALIDATION SUMMARY ==========');
    console.log(`Total Tested Elements: ${allResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / allResults.length) * 100).toFixed(2)}%`);
    console.log('=======================================\n');
    
    console.log(`CSV Report generated at: ${REPORT_PATH}`);
    console.log(`HTML Report generated at: ${HTML_REPORT_PATH}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();