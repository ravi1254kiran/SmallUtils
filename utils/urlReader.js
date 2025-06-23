/**
 * URL Reader Utility
 * Developer: Rakula (ID: 3222)
 * Created: June 2025
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to read URLs from JSON file
async function readUrlsFromJson(filePath) {
    try {
        console.log(`Reading URLs from JSON file: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`JSON file not found: ${filePath}`);
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const urls = JSON.parse(data);
        
        console.log(`Found ${urls.length} URLs`);
        return urls;
    } catch (error) {
        console.error(`Error reading URLs: ${error.message}`);
        // If there's an error, return default URLs as a fallback
        console.log('Using default URLs as fallback');
        return [
            'https://qawww.capella.edu/',
            'https://qawww.capella.edu/capella-experience/compare-learning-formats/'
        ];
    }
}

module.exports = { readUrlsFromJson };
