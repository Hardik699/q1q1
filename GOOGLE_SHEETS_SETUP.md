# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration to sync all your master data into organized sub-sheets.

## 📋 Overview

The Master Admin page can sync all application data to a Google Sheets document with the following separate sheets:

1. **Summary** - Overview of all data counts and last updated timestamps
2. **Employees** - Complete HR employee records with personal and work details
3. **Admin_Users** - System admin accounts and credential status
4. **Departments** - Department structure with managers and employee counts
5. **System_Assets** - All hardware inventory (mouse, keyboard, RAM, storage, etc.)
6. **PC_Laptop_Configs** - Complete system builds with component mapping
7. **IT_Accounts** - Employee IT credentials and system assignments
8. **Salary_Records** - Detailed payroll information with calculations
9. **Leave_Requests** - Employee leave status and approvals
10. **IT_Notifications** - Pending IT setup requests
11. **Attendance_Records** - Employee attendance tracking

## 🚀 Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create a Service Account

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - **Name**: `master-admin-sheets-sync`
   - **Description**: `Service account for syncing master admin data to Google Sheets`
4. Click "Create and Continue"
5. Skip granting access to project (click "Continue")
6. Skip granting user access (click "Done")

### Step 3: Generate Service Account Key

1. Click on the created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Click "Create" - this will download a JSON file
6. **Important**: Keep this file secure and never commit it to your repository

### Step 4: Create Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Give it a meaningful name like "Master Admin Data Sync"
4. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 5: Share Spreadsheet with Service Account

1. In your Google Sheets document, click "Share"
2. Add the service account email (found in the JSON file as `client_email`)
3. Give it "Editor" permissions
4. Click "Send"

### Step 6: Configure Environment Variables

Add these environment variables to your application:

#### Using Builder.io Environment Variables:

1. Click the "Dev Server Control" button
2. Use `set_env_variable` to add:

```bash
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"..."}
```

#### Or using .env file (local development):

```env
GOOGLE_SHEET_ID=1ABC123def456ghi789jkl0mn_your_actual_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"master-admin-sheets-sync@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/master-admin-sheets-sync%40your-project.iam.gserviceaccount.com"}
```

**⚠️ Security Note**:

- The entire JSON content should be on one line for the environment variable
- Never commit credentials to your repository
- Use environment variables or secure credential storage

### Step 7: Test the Integration

1. Restart your development server if needed
2. Go to the Master Admin page (`/master-admin`)
3. Check the "Google Sheets Integration Status" card
4. If configured correctly, you should see "Connected" status
5. Click "Sync All Data" to perform your first sync
6. Open your Google Sheets document to verify the data

## 📊 Data Organization

When you sync, the following sheets will be created/updated:

### Summary Sheet

- Data type counts
- Last updated timestamps
- Quick overview of all records

### Employees Sheet

- Complete employee records
- Personal information (name, contact, family details)
- Work information (department, position, salary)
- Document status and dates

### System Assets Sheet

- Hardware inventory with specifications
- Warranty and purchase information
- Category-specific details (RAM size, storage capacity, etc.)
- Vonage phone system details

### PC/Laptop Configurations Sheet

- Complete system builds
- Component mapping with asset details
- Hardware combinations and configurations

### IT Accounts Sheet

- Employee IT credentials (emails masked in sheets)
- System assignments
- Software licenses and access details

### Salary Records Sheet

- Detailed payroll calculations
- Working days and attendance factors
- Bonus and deduction breakdowns

### Other Supporting Sheets

- Departments, Leave Requests, IT Notifications, Attendance Records

## 🔧 Troubleshooting

### "Not Configured" Status

- Check environment variables are set correctly
- Verify spreadsheet ID is correct
- Ensure service account JSON is valid

### "Permission Denied" Errors

- Check if spreadsheet is shared with service account email
- Verify service account has "Editor" permissions
- Confirm Google Sheets API is enabled

### "Spreadsheet Not Found" Errors

- Verify the spreadsheet ID in the environment variable
- Ensure the spreadsheet exists and is accessible
- Check the URL format is correct

### Sync Errors

- Check server logs for detailed error messages
- Verify all required data fields are present
- Ensure stable internet connection

## 🔄 Regular Sync Workflow

1. **Manual Sync**: Use "Sync All Data" button in Master Admin
2. **Monitor Status**: Check the integration status card
3. **Verify Data**: Open spreadsheet to confirm data accuracy
4. **Troubleshoot**: Use setup instructions if issues arise

## 📱 Features

- **Automatic Sheet Creation**: All necessary sheets are created automatically
- **Data Validation**: Cross-references between related records
- **Comprehensive Coverage**: All application data is included
- **Real-time Status**: Live configuration and sync status
- **Error Handling**: Detailed error messages for troubleshooting
- **Batch Updates**: Efficient bulk data synchronization

## 🛡️ Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** service account keys
4. **Monitor access** to your Google Sheets document
5. **Limit permissions** to only what's necessary

---

## 🆘 Support

If you encounter issues:

1. Check the Google Sheets Integration Status card in Master Admin
2. Review server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure Google Sheets API is enabled in your project
5. Confirm service account has proper permissions

Your master data will be organized in professional spreadsheet format with automatic updates whenever you sync!
