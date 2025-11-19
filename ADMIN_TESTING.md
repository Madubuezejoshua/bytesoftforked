# Admin Panel Testing Guide

This guide will help you test all admin panel functionality.

## Setup

1. **Create an Admin Account** (see CREATE_ADMIN.md)
2. **Start the development server**: The dev server is already running automatically
3. **Navigate to**: http://localhost:5173/admin-login

## Test Cases

### 1. Admin Authentication

#### Test 1.1: Valid Admin Login
- Go to `/admin-login`
- Enter valid admin credentials
- Expected: Redirect to `/admin-panel`
- Expected: See welcome message with admin name

#### Test 1.2: Invalid Admin Login
- Go to `/admin-login`
- Enter invalid credentials or non-admin account
- Expected: Error message "Invalid admin credentials"

#### Test 1.3: Admin Session Persistence
- Login as admin
- Refresh the page
- Expected: Still logged in, on admin panel

### 2. ID Generation Tab

#### Test 2.1: Generate Single Teacher Code
- Click "ID Generation" tab
- In "Teacher Codes" card, click "Generate Single Code"
- Expected: 6-digit code appears in the "Generated Codes" table
- Expected: Success toast notification
- Expected: Code status is "unused"

#### Test 2.2: Generate Bulk Teacher Codes
- Enter "10" in the bulk generate input
- Click "Generate" button
- Expected: 10 new 6-digit teacher codes appear
- Expected: All codes are unique

#### Test 2.3: Generate Single Coordinator Code
- In "Coordinator Codes" card, click "Generate Single Code"
- Expected: 8-digit code appears in the table
- Expected: Code status is "unused"

#### Test 2.4: Generate Bulk Coordinator Codes
- Enter "5" in the coordinator bulk input
- Click "Generate" button
- Expected: 5 new 8-digit coordinator codes appear

#### Test 2.5: Export Codes to CSV
- Generate some codes
- Click "Export CSV" button
- Expected: CSV file downloads with all generated codes
- Expected: CSV contains: Code, Type, Status, Generated At

#### Test 2.6: Copy Code to Clipboard
- Click copy icon next to any code
- Paste in text editor
- Expected: Code is copied correctly

### 3. ID Management Tab

#### Test 3.1: View All Access Codes
- Click "ID Management" tab
- Expected: See all generated codes from all admins
- Expected: Statistics showing Total, Unused, and Used codes

#### Test 3.2: Search Codes
- Type code number in search box
- Expected: Table filters to matching codes

#### Test 3.3: Filter by Type
- Select "Teacher" from type dropdown
- Expected: Only 6-digit teacher codes shown
- Select "Coordinator"
- Expected: Only 8-digit coordinator codes shown

#### Test 3.4: Filter by Status
- Select "Unused" from status dropdown
- Expected: Only unused codes shown
- Select "Used"
- Expected: Only used codes shown

#### Test 3.5: View Used Code Details
- Find a used code (if any)
- Expected: "Used By" column shows user ID
- Expected: "Used At" column shows timestamp

### 4. Account Management Tab

#### Test 4.1: View All User Accounts
- Click "Accounts" tab
- Expected: See all user accounts (students, teachers, coordinators)
- Expected: Statistics showing Active, Suspended, Deleted counts

#### Test 4.2: Search Accounts
- Type in search box (user ID, access code, or role)
- Expected: Table filters to matching accounts

#### Test 4.3: View Account Details
- Click "View" button on any account
- Expected: Modal opens with:
  - User information (name, email)
  - Statistics (enrollments, courses created)
  - Suspension details (if suspended)

#### Test 4.4: Suspend Account
- Click suspend icon on an active account
- Enter suspension reason: "Test suspension"
- Click "Suspend"
- Expected: Account status changes to "suspended"
- Expected: Success toast
- Expected: Account no longer appears in active filter

#### Test 4.5: Unsuspend Account
- Find a suspended account
- Click unsuspend icon (checkmark)
- Expected: Account status changes to "active"
- Expected: Success toast

#### Test 4.6: Reset Account
- Click reset icon on an account
- Confirm the action
- Expected: All user data deleted (enrollments, classes, courses)
- Expected: Account remains active
- Expected: Success toast

#### Test 4.7: Delete Account
- Click delete icon on an account
- Confirm the action
- Expected: Account and ALL associated data deleted
- Expected: Status changes to "deleted"
- Expected: Success toast
- Expected: User cannot login anymore

### 5. Audit Logs Tab

#### Test 5.1: View Audit Logs
- Click "Audit Logs" tab
- Expected: See chronological list of all admin actions
- Expected: Each log shows:
  - Action type badge
  - Admin name who performed action
  - Target type and ID
  - Timestamp
  - Details description

#### Test 5.2: Verify Log Entries
- Perform various actions (generate code, suspend account)
- Go to Audit Logs tab
- Expected: New entries appear for each action
- Expected: Correct details for each action

#### Test 5.3: Export Audit Logs
- Click "Export CSV" button
- Expected: CSV downloads with all logs
- Expected: CSV contains: Timestamp, Admin, Action, Target Type, Target ID, Details

### 6. Navigation & UI

#### Test 6.1: Tab Switching
- Click through all 4 tabs
- Expected: Content changes appropriately
- Expected: Active tab is highlighted

#### Test 6.2: Logout
- Click "Logout" button in navbar
- Expected: Redirect to homepage
- Expected: Cannot access admin panel without login

#### Test 6.3: Back to Login Link
- On admin login page, click "Back to login"
- Expected: Navigate to regular login page

## Firebase Collections Structure

Your admin panel uses these Firestore collections:

```
admins/
  {userId}/
    - email: string
    - name: string
    - role: "admin"
    - createdAt: string

accessCodes/
  {codeId}/
    - code: string (6 or 8 digits)
    - type: "teacher" | "coordinator"
    - status: "unused" | "used"
    - generatedAt: string
    - generatedBy: string (admin userId)
    - usedBy: string | null
    - usedAt: string | null

userAccounts/
  {accountId}/
    - userId: string
    - accessCode: string
    - role: "student" | "teacher" | "coordinator"
    - status: "active" | "suspended" | "deleted"
    - suspensionReason?: string
    - suspendedAt?: string
    - suspendedBy?: string (admin userId)
    - createdAt: string
    - updatedAt: string

auditLogs/
  {logId}/
    - adminId: string
    - adminName: string
    - action: "generate_code" | "delete_account" | "reset_account" | "suspend_account" | "unsuspend_account"
    - targetId: string
    - targetType: "user" | "code"
    - details: string
    - timestamp: string

users/
  {userId}/
    - email: string
    - name: string
    - role: "student" | "teacher" | "coordinator"
    - createdAt: string
```

## Common Issues & Solutions

### Issue: Admin cannot login
**Solution**: Verify the admin document exists in `admins` collection with correct `role: "admin"` field

### Issue: "No codes to export" message
**Solution**: Generate some codes first before attempting export

### Issue: Account actions not working
**Solution**: Check browser console for Firebase permission errors. Ensure Firestore rules allow admin operations.

### Issue: Audit logs not showing
**Solution**: Perform some actions first to generate logs. Check that `auditLogs` collection exists.

## Security Notes

- Admin role is checked in both `admins` collection and during login
- Regular users cannot access admin panel even if they know the URL
- All admin actions are logged for audit purposes
- Account suspension prevents user login immediately
- Deleted accounts cannot be recovered
