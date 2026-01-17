# 🔗 Step 4: Link Workflows (Update IDs)

**Prerequisites**: 
1. Step 2 Complete (Workflows imported)
2. Step 3 Complete (Credentials configured)

**Date**: 16 Януари 2026

---

## 🎯 The Task
The "Main V3 Workflow" needs to call the "SMS Worker" and "Email Worker". 
You must tell the Main Workflow *which* ID belongs to those workers.

---

## 📋 Instructions

### 1. Get the IDs

1. Open **"DuoPlus SMS Worker (Improved)"**
   - Look at the URL: `.../workflow/YOUR_SMS_ID_HERE`
   - **Copy this ID**. (Example: `B7827...`)

2. Open **"Email OTP Extractor"**
   - Look at the URL: `.../workflow/YOUR_EMAIL_ID_HERE`
   - **Copy this ID**.

### 2. Update Main Workflow

1. Open **"Wallester Registration Agent V3 (Fixed Timing)"**

2. **Find Node: "Listen for SMS OTP"**
   - It's usually near the beginning/middle.
   - Click to open.
   - Find field **"Workflow ID"** (or "Workflow to Execute").
   - **Paste** the SMS Worker ID.
   - *Alternative*: If it's a dropdown, simply select "DuoPlus SMS Worker (Improved)".

3. **Find Node: "Listen for Email OTP"**
   - Click to open.
   - Find field **"Workflow ID"**.
   - **Paste** the Email Worker ID.
   - *Alternative*: Select "Email OTP Extractor" from dropdown.

4. **Click "Save"** (Top Right).

---

## ✅ Verification
- Open "Listen for SMS OTP" node -> Ensure it points to correct workflow.
- Open "Listen for Email OTP" node -> Ensure it points to correct workflow.
- No Red warning icons.

**Next**: Proceed to **Phase 6: Activate & Test**!
