const { chromium } = require('playwright');

async function openChatGPT() {
  console.log('Launching browser...');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: false // Open visible browser window
  });
  
  console.log('Creating new page...');
  const page = await browser.newPage();
  
  console.log('Navigating to ChatGPT.com...');
  await page.goto('https://chatgpt.com');
  
  console.log('Successfully opened ChatGPT.com!');
  console.log('Browser will remain open. Press Ctrl+C to close.');
  
  // Keep the browser open
  // User can close manually or press Ctrl+C
}

// Run the function
openChatGPT().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
