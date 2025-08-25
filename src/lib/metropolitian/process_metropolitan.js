const fs = require('fs');
const path = require('path');

// Import the epochize function from the compiled build
const { epochize } = require('../../../build/lib/index');

// Proper CSV parsing that handles quoted commas
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const data = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    
    if (i === 0) {
      data.headers = row;
    } else {
      const rowObj = {};
      data.headers.forEach((header, index) => {
        rowObj[header] = row[index] || '';
      });
      data.push(rowObj);
    }
  }
  
  return data;
}

// CSV writing helper that properly quotes fields containing commas
function writeCSV(filename, headers, rows) {
  const escapeField = (field) => {
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const csvContent = [
    headers.map(escapeField).join(','),
    ...rows.map(row => row.map(escapeField).join(','))
  ].join('\n');
  
  fs.writeFileSync(filename, csvContent);
  console.log(`Written ${rows.length} rows to ${filename}`);
}

// Load existing blocklist from CSV (if it exists)
function loadBlocklist(blocklistPath) {
  const blocklistSet = new Set();
  
  if (fs.existsSync(blocklistPath)) {
    try {
      const blocklistContent = fs.readFileSync(blocklistPath, 'utf-8');
      const blocklistData = parseCSV(blocklistContent);
      
      blocklistData.forEach(row => {
        if (row['Object Date']) {
          blocklistSet.add(row['Object Date']);
        }
      });
      
      console.log(`Loaded ${blocklistSet.size} items from existing blocklist`);
    } catch (error) {
      console.log('No existing blocklist found, starting fresh');
    }
  }
  
  return blocklistSet;
}

// Check if date should be added to blocklist based on patterns
function shouldAddToBlocklist(objectDate) {
  const blocklistPatterns = [
    /^$/,  // Empty strings
    /^\s*$/,  // Only whitespace
    /^n\.d\.?$/i,  // "n.d." (no date)
    /^unknown$/i,
    /^undated$/i,
    /^not\s+dated$/i,
    /^date\s+unknown$/i,
    /^\?+$/,  // Only question marks
    /^-+$/,   // Only dashes
  ];
  
  return blocklistPatterns.some(pattern => pattern.test(objectDate));
}

function main() {
  console.log('Processing Metropolitan Museum object dates...');
  
  // Read the CSV file
  const csvPath = path.join(__dirname, 'object_dates.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const data = parseCSV(csvContent);
  
  console.log(`Loaded ${data.length} records from CSV`);
  
  // Load existing blocklist
  const blocklistPath = path.join(__dirname, 'blocklist.csv');
  const existingBlocklist = loadBlocklist(blocklistPath);
  
  const passing = [];
  const failing = [];
  const blocklist = [];
  
  data.forEach((row, index) => {
    const objectDate = row['Object Date'];
    const beginDate = parseInt(row['Object Begin Date']);
    const endDate = parseInt(row['Object End Date']);
    
    // Check if this date is in the existing blocklist
    if (existingBlocklist.has(objectDate)) {
      console.log(`Skipping blocklisted item: ${objectDate}`);
      return;
    }
    
    // Check if this date should be added to blocklist
    if (shouldAddToBlocklist(objectDate)) {
      blocklist.push([objectDate]);
      return;
    }
    
    try {
      // Process with epochize
      const result = epochize(objectDate);
      
      if (result === null) {
        failing.push([objectDate, beginDate, endDate, '', '', 'epochize returned null']);
        return;
      }
      
      const [epochStart, epochEnd] = result;
      const epochStartYear = epochStart.getFullYear();
      const epochEndYear = epochEnd.getFullYear();
      
      // Check if the epochized years match the expected years
      if (epochStartYear === beginDate && epochEndYear === endDate) {
        passing.push([objectDate, beginDate, endDate, epochStartYear, epochEndYear, 'PASS']);
      } else {
        failing.push([objectDate, beginDate, endDate, epochStartYear, epochEndYear, `Expected: ${beginDate}-${endDate}, Got: ${epochStartYear}-${epochEndYear}`]);
      }
      
    } catch (error) {
      failing.push([objectDate, beginDate, endDate, '', '', 'Error: ' + error.message]);
    }
    
    // Progress indicator
    if ((index + 1) % 1000 === 0) {
      console.log(`Processed ${index + 1}/${data.length} records...`);
    }
  });
  
  console.log(`\nResults:`);
  console.log(`- Passing: ${passing.length}`);
  console.log(`- Failing: ${failing.length}`);
  console.log(`- New blocklist items: ${blocklist.length}`);
  
  // Write the results to CSV files
  const outputDir = __dirname;
  
  writeCSV(
    path.join(outputDir, 'passing_results.csv'),
    ['Object Date', 'Expected Begin', 'Expected End', 'Epochized Begin', 'Epochized End', 'Status'],
    passing
  );
  
  writeCSV(
    path.join(outputDir, 'failing_results.csv'),
    ['Object Date', 'Expected Begin', 'Expected End', 'Epochized Begin', 'Epochized End', 'Error'],
    failing
  );
  
  // Append new items to blocklist (or create if doesn't exist)
  if (blocklist.length > 0) {
    let allBlocklistItems = [];
    
    // Add existing items
    existingBlocklist.forEach(item => {
      allBlocklistItems.push([item]);
    });
    
    // Add new items
    allBlocklistItems.push(...blocklist);
    
    writeCSV(
      path.join(outputDir, 'blocklist.csv'),
      ['Object Date'],
      allBlocklistItems
    );
  }
  
  console.log('\nProcessing complete!');
}

if (require.main === module) {
  main();
}