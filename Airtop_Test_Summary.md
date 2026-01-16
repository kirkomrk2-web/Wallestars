# Airtop Registration Agent Test Results

## Configuration
*   **Workflow:** `universal-registration-agent.json` (Updated with Airtop API logic)
*   **Target Websites:**
    1.  Dropbox
    2.  MySpace
    3.  Vimeo
    4.  Eventbrite
    5.  SurveyMonkey
*   **Identity Provider:** `crules1.33mail.com` (Auto-generated aliases)

## Execution Instructions
1.  **Import:** Import the updated workflow into n8n.
2.  **API Key:** Create a Credential in n8n named `Airtop API Key` (Header Auth) with your Airtop Key.
    *   *Key Location:* [Airtop Portal](https://portal.airtop.ai/api-keys)
3.  **Run:** Click "Execute Workflow".

## Expected Outcome
The agent will sequentially:
1.  Spin up a cloud browser via Airtop.
2.  Navigate to each sign-up page.
3.  Use AI to fill the forms based on the generated identity.
4.  Terminate the session.
5.  Wait for verification emails (monitored via the separate Gmail loop or manual check).

*Note: Since Airtop consumes credits, ensure your quota is sufficient for 5 concurrent or sequential sessions.*
