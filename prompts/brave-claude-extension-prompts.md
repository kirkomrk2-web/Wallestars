# Brave Browser + Claude Extension Prompts for Wallestars Control Center

> Ready-to-use prompts for executing Wallestars operations through Claude in Brave browser via the MCP SuperAssistant extension.

## Prerequisites

1. **Brave browser** with MCP SuperAssistant extension installed
2. **Wallestars server running** (`npm run dev` or `npm run server`)
3. **SSE endpoint active** at `http://localhost:3000/sse`
4. Extension configured to connect to `http://localhost:3000/sse`

### Verify Connection

Paste this URL in Brave to verify the server is running:
```
http://localhost:3000/api/health
```

Expected response includes: `claude`, `computerUse`, `android`, `documentScanner`, `hostinger` service status.

---

## 1. System Health & Diagnostics

### Full System Health Check
```
Check the Wallestars Control Center health status. Call GET http://localhost:3000/api/health and report which services are available: Claude AI, Computer Use, Android control, Document Scanner, and Hostinger VPS. Show me a summary of what's online and what's offline.
```

### System Information
```
Get my Linux system information from the Wallestars server. Call GET http://localhost:3000/api/computer/info to retrieve hostname, uptime, memory usage, platform, and architecture. Format the results clearly.
```

### SSE Connection Status
```
Check the MCP SuperAssistant SSE health. Call GET http://localhost:3000/sse/health to see how many clients are connected and if the endpoint is healthy. Also call GET http://localhost:3000/sse/clients to list all connected client IDs.
```

---

## 2. Claude AI Chat

### General Conversation
```
Send the following message to Claude via the Wallestars chat API.
Call POST http://localhost:3000/api/claude/chat with:
{
  "message": "Explain the key differences between React Server Components and traditional client-side React rendering.",
  "conversationHistory": []
}
Return Claude's response formatted in markdown.
```

### Multi-Turn Conversation
```
Continue the following conversation with Claude. Call POST http://localhost:3000/api/claude/chat with:
{
  "message": "Now give me a practical code example of this concept",
  "conversationHistory": [
    {"role": "user", "content": "[YOUR PREVIOUS MESSAGE]"},
    {"role": "assistant", "content": "[CLAUDE'S PREVIOUS RESPONSE]"}
  ]
}
```

### Code Review via Chat
```
Ask Claude to review this code through the Wallestars chat API.
Call POST http://localhost:3000/api/claude/chat with:
{
  "message": "Review this JavaScript function for bugs, performance issues, and security vulnerabilities:\n\n```js\nfunction processUserInput(input) {\n  const result = eval(input);\n  document.innerHTML = result;\n  return fetch('/api/data?q=' + input);\n}\n```\nProvide specific fixes for each issue found.",
  "conversationHistory": []
}
```

### Get Available AI Models
```
Query the available Claude models and capabilities. Call GET http://localhost:3000/api/claude/capabilities and list all models with their supported features (chat, computer-use, vision, coding). Also show which platform features are enabled.
```

---

## 3. Linux Desktop Control (Computer Use)

### Take Desktop Screenshot
```
Capture the current Linux desktop screenshot. Call GET http://localhost:3000/api/computer/screenshot. Return the timestamp and confirm the screenshot was captured. If possible, describe what's visible on screen.
```

### Click at Screen Coordinates
```
Click the mouse at screen position (500, 300) on the Linux desktop.
Call POST http://localhost:3000/api/computer/click with:
{
  "x": 500,
  "y": 300,
  "button": 1
}
Confirm the click was executed.
```

### Type Text on Desktop
```
Type the following text on the Linux desktop using xdotool.
Call POST http://localhost:3000/api/computer/type with:
{
  "text": "Hello from Claude via Wallestars Control Center"
}
Confirm the text was typed.
```

### Press a Keyboard Shortcut
```
Press the keyboard shortcut Ctrl+S on the Linux desktop.
Call POST http://localhost:3000/api/computer/key with:
{
  "key": "ctrl+s"
}
Confirm the key press was executed.
```

### Run a Safe Shell Command
```
Execute a safe shell command on the server.
Call POST http://localhost:3000/api/computer/execute with:
{
  "command": "uname -a"
}
Show me the output. Note: only whitelisted commands are allowed (ls, pwd, date, whoami, uname).
```

### AI-Driven Desktop Automation
```
Use Claude's computer use capabilities to automate a task. First capture a screenshot with GET http://localhost:3000/api/computer/screenshot, then send it to Claude's vision endpoint:
Call POST http://localhost:3000/api/claude/computer-use with:
{
  "task": "Find and open the file manager application on the desktop",
  "screenshot": "[BASE64_SCREENSHOT_DATA]"
}
Claude will analyze the screenshot and return the next action (click coordinates, text to type, or key to press). Execute the recommended action.
```

---

## 4. Android Device Control (ADB)

### List Connected Devices
```
List all Android devices connected via ADB.
Call GET http://localhost:3000/api/android/devices.
Show me each device ID, connection status, and device info.
```

### Capture Android Screenshot
```
Take a screenshot of the connected Android device.
Call POST http://localhost:3000/api/android/screenshot with:
{
  "deviceId": ""
}
Leave deviceId empty to use the default device. Confirm the screenshot was captured.
```

### Tap on Android Screen
```
Tap on the Android screen at coordinates (540, 960) - center of a typical 1080x1920 display.
Call POST http://localhost:3000/api/android/tap with:
{
  "x": 540,
  "y": 960,
  "deviceId": ""
}
Confirm the tap was executed.
```

### Swipe on Android Screen
```
Perform a swipe gesture on the Android device from bottom to top (scroll up).
Call POST http://localhost:3000/api/android/swipe with:
{
  "startX": 540,
  "startY": 1500,
  "endX": 540,
  "endY": 500,
  "duration": 300,
  "deviceId": ""
}
Confirm the swipe was executed.
```

### Type Text on Android
```
Type text into the currently focused field on the Android device.
Call POST http://localhost:3000/api/android/type with:
{
  "text": "Hello from Wallestars",
  "deviceId": ""
}
Confirm the text was entered.
```

### Press Android Hardware Buttons
```
Press the Home button on the Android device.
Call POST http://localhost:3000/api/android/key with:
{
  "key": "KEYCODE_HOME",
  "deviceId": ""
}
Other useful keys: KEYCODE_BACK, KEYCODE_POWER, KEYCODE_MENU, KEYCODE_ENTER.
```

### Get Android Device Info
```
Get detailed information about the connected Android device.
Call GET http://localhost:3000/api/android/info.
Show me device model, Android version, battery level, and other details.
```

---

## 5. Document Scanner (Smart Scan)

### Classify a Document
```
Classify this document image. Call POST http://localhost:3000/api/document-scanner/classify with:
{
  "image": "[BASE64_IMAGE_DATA]",
  "imageType": "image/jpeg"
}
Claude will analyze the image and classify it as: invoice, receipt, note, memo, contract, form, or other.
```

### Extract Invoice Data
```
Extract all structured data from this invoice image.
Call POST http://localhost:3000/api/document-scanner/extract-invoice with:
{
  "image": "[BASE64_IMAGE_DATA]",
  "imageType": "image/jpeg"
}
Return the extracted JSON with: invoice number, date, vendor details, customer details, line items (description, quantity, unit price, total), subtotal, tax, total amount, and currency.
```

### Extract Data from Other Document Types
```
Extract data from a receipt image.
Call POST http://localhost:3000/api/document-scanner/extract-document with:
{
  "image": "[BASE64_IMAGE_DATA]",
  "imageType": "image/jpeg",
  "documentType": "receipt"
}
Supported types: receipt, note, form. Returns structured JSON specific to the document type.
```

### Validate Extracted Invoice Data
```
Validate this extracted invoice data for errors and inconsistencies.
Call POST http://localhost:3000/api/document-scanner/validate-invoice with:
{
  "data": {
    "vendorName": "Example Corp",
    "invoiceNumber": "INV-2026-001",
    "invoiceDate": "2026-02-01",
    "dueDate": "2026-03-01",
    "items": [
      {"description": "Service A", "quantity": 2, "unitPrice": 50.00, "totalPrice": 100.00},
      {"description": "Service B", "quantity": 1, "unitPrice": 75.00, "totalPrice": 75.00}
    ],
    "subtotal": 175.00,
    "taxRate": 20.00,
    "taxAmount": 35.00,
    "totalAmount": 210.00,
    "currency": "BGN"
  }
}
Show validation errors, warnings, and whether manual review is needed.
```

### Export to Delta BG CSV Format
```
Export validated invoice documents to Delta BG CSV format for Bulgarian accounting software.
Call POST http://localhost:3000/api/document-scanner/export/delta-bg with:
{
  "documents": [
    {
      "documentType": "invoice",
      "validationStatus": "validated",
      "data": {
        "invoiceNumber": "INV-001",
        "invoiceDate": "2026-02-01",
        "vendorName": "Example Corp",
        "vendorTaxId": "BG123456789",
        "totalAmount": 210.00,
        "currency": "BGN",
        "subtotal": 175.00,
        "taxRate": 20.00,
        "taxAmount": 35.00
      }
    }
  ]
}
Return the CSV content and file name for download.
```

### Export to TRZ XML Format
```
Export validated invoice documents to TRZ XML format.
Call POST http://localhost:3000/api/document-scanner/export/trz with:
{
  "documents": [
    {
      "documentType": "invoice",
      "validationStatus": "validated",
      "data": {
        "invoiceNumber": "INV-001",
        "invoiceDate": "2026-02-01",
        "vendorName": "Example Corp",
        "vendorTaxId": "BG123456789",
        "totalAmount": 210.00,
        "currency": "BGN",
        "items": [
          {"description": "Web Development", "quantity": 10, "unitPrice": 17.50, "totalPrice": 175.00}
        ],
        "subtotal": 175.00,
        "taxRate": 20.00,
        "taxAmount": 35.00
      }
    }
  ]
}
Return the XML content and metadata.
```

---

## 6. Image Analysis (QR Scanner / Vision)

### Analyze Any Image
```
Analyze this image using Claude's vision capabilities.
Call POST http://localhost:3000/api/claude/analyze-image with:
{
  "image": "data:image/jpeg;base64,[BASE64_DATA]",
  "prompt": "Describe what you see in this image. Identify any text, logos, objects, or notable elements."
}
Return the extracted data and analysis.
```

### Read QR Code from Image
```
Analyze this image to find and decode any QR codes.
Call POST http://localhost:3000/api/claude/analyze-image with:
{
  "image": "data:image/png;base64,[BASE64_DATA]",
  "prompt": "Find any QR codes in this image. Decode them and return the embedded URL or data. Return as JSON: {\"qrCodes\": [{\"data\": \"decoded content\", \"type\": \"url|text|vcard\"}]}"
}
```

---

## 7. Hostinger VPS Management

### List All VPS Instances
```
List all my Hostinger VPS instances.
Call GET http://localhost:3000/api/hostinger/vps.
Show me each instance with its name, status, IP address, and resource allocation.
```

### Get VPS Details
```
Get detailed information about a specific VPS instance.
Call GET http://localhost:3000/api/hostinger/vps/{VPS_ID}.
Replace {VPS_ID} with the actual ID. Show me the full configuration, resource usage, and status.
```

---

## 8. MCP Tool Execution (SSE)

### Execute Screenshot via MCP
```
Execute the screenshot tool through the MCP SSE endpoint.
Call POST http://localhost:3000/sse/execute with:
{
  "tool": "screenshot",
  "params": {}
}
This triggers a screenshot capture and broadcasts the result to all connected SSE clients.
```

### Execute Click via MCP
```
Execute a click action through the MCP SSE endpoint.
Call POST http://localhost:3000/sse/execute with:
{
  "tool": "click",
  "params": {"x": 500, "y": 300}
}
```

### Execute Type via MCP
```
Type text through the MCP SSE endpoint.
Call POST http://localhost:3000/sse/execute with:
{
  "tool": "type",
  "params": {"text": "Hello from MCP"}
}
```

---

## 9. Workflow Automation Chains

### Full Document Processing Pipeline
```
Execute the complete document scanning pipeline:

1. First, classify the document:
   POST http://localhost:3000/api/document-scanner/classify
   with the image data.

2. Based on classification, extract data:
   - If "invoice": POST /api/document-scanner/extract-invoice
   - Otherwise: POST /api/document-scanner/extract-document

3. Validate the extracted data:
   POST http://localhost:3000/api/document-scanner/validate-invoice

4. If validation passes, export:
   POST http://localhost:3000/api/document-scanner/export/delta-bg

Report results at each step. Flag any validation warnings for my review.
```

### Desktop Automation Loop
```
Run an automated desktop control loop:

1. Take a screenshot: GET http://localhost:3000/api/computer/screenshot
2. Send to Claude for analysis: POST http://localhost:3000/api/claude/computer-use
   with task: "Open the terminal application"
3. Execute Claude's recommended action (click/type/key)
4. Take another screenshot to verify the result
5. Report what happened at each step

Repeat steps 2-4 up to 3 times until the task is complete or Claude indicates no further action is needed.
```

### Android App Testing Sequence
```
Run an automated Android testing sequence:

1. List devices: GET http://localhost:3000/api/android/devices
2. Get device info: GET http://localhost:3000/api/android/info
3. Take screenshot: POST http://localhost:3000/api/android/screenshot
4. Press Home: POST http://localhost:3000/api/android/key with {"key": "KEYCODE_HOME"}
5. Take another screenshot to verify home screen
6. Report device details and both screenshots
```

---

## 10. Prompt Generation

### Generate Spark App Prompt
```
Using the Wallestars prompt generator, create a Spark Visual Application prompt that:
- Accepts AI chat links and GitHub PR URLs as input
- Extracts key decisions and action items
- Displays them as interactive cards with selection buttons
- Exports selected items as a JSON decision tree
- Generates a QR code linking to the session results

Format the output as a complete prompt ready for use in the Anthropic Console Workbench.
```

---

## Tips for Using These Prompts

1. **Authentication**: If the server requires auth, add the header:
   ```
   Authorization: Bearer sk-ant-YOUR_KEY or ws-YOUR_KEY
   ```

2. **Base64 Images**: For document scanner and vision prompts, replace `[BASE64_IMAGE_DATA]` with actual base64-encoded image data. You can convert images at the browser console:
   ```js
   // In Brave DevTools console
   const input = document.createElement('input');
   input.type = 'file';
   input.onchange = (e) => {
     const reader = new FileReader();
     reader.onload = () => console.log(reader.result);
     reader.readAsDataURL(e.target.files[0]);
   };
   input.click();
   ```

3. **Chaining Prompts**: Use conversation history from one Claude chat call as input to the next for multi-turn workflows.

4. **Error Handling**: If a request returns `success: false`, the error message will explain what went wrong (missing API key, service disabled, command not whitelisted, etc.).

5. **Real-time Updates**: Connect to `http://localhost:3000/sse` via EventSource in the browser to receive real-time tool execution results and system broadcasts.
