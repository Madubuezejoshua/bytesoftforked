# Admin Panel - Complete Setup & Usage Guide

Your admin panel is now fully functional and integrated with Firebase! This guide will help you get started.

## 🎉 What's Been Implemented

### ✅ Admin Authentication
- Separate admin login page at `/admin-login`
- Admin verification through `admins` collection in Firestore
- Session persistence and protected routes
- Automatic redirect for unauthorized users

### ✅ ID Generation Tab
- Generate single or bulk teacher codes (6-digit)
- Generate single or bulk coordinator codes (8-digit)
- View all generated codes in real-time table
- Copy codes to clipboard
- Export codes to CSV
- Automatic uniqueness checking

### ✅ ID Management Tab
- View all access codes from all admins
- Search by code or user
- Filter by type (teacher/coordinator)
- Filter by status (unused/used)
- Statistics dashboard (total, unused, used)
- View usage details (who used, when)

### ✅ Account Management Tab
- View all user accounts (students, teachers, coordinators)
- Search by user ID, access code, or role
- View detailed account information
- Suspend accounts with reason tracking
- Unsuspend accounts
- Reset accounts (clear data, keep account)
- Delete accounts (permanent removal)
- Statistics dashboard (active, suspended, deleted)

### ✅ Audit Logs Tab
- Complete audit trail of all admin actions
- View who did what and when
- Color-coded action badges
- Detailed action descriptions
- Export logs to CSV
- Immutable log records

### ✅ Security & Permissions
- Secure Firestore rules
- Role-based access control
- Admin verification at database level
- Protected sensitive operations
- Audit trail for compliance

## 🚀 Quick Start Guide

### Step 1: Deploy Firestore Rules

1. Open `firestore.rules` file in your project
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select project: `lamp-study`
4. Navigate to **Firestore Database** → **Rules** tab
5. Copy and paste the rules from `firestore.rules`
6. Click **Publish**

**Important**: The rules MUST be deployed for the admin panel to work properly!

See `FIRESTORE_RULES_DEPLOYMENT.md` for detailed instructions.

### Step 2: Create Your First Admin Account

You need to manually create an admin account in Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `lamp-study`
3. Go to **Authentication** → **Users** tab
4. Click **Add user**
5. Enter email and password (e.g., `admin@lampStudy.com` / `SecurePassword123!`)
6. Copy the **User UID** generated
7. Go to **Firestore Database**
8. Click **Start collection** (if `admins` doesn't exist) or go to `admins` collection
9. Create a document with:
   - **Document ID**: The User UID you copied
   - **Fields**:
     ```
     email: "admin@lampStudy.com"
     name: "Admin Name"
     role: "admin"
     createdAt: "2025-10-24T10:00:00.000Z"
     ```
10. Click **Save**

See `CREATE_ADMIN.md` for detailed instructions.

### Step 3: Test Admin Login

1. Your dev server is already running automatically
2. Open browser: http://localhost:5173/admin-login
3. Enter your admin credentials
4. You should be redirected to the admin panel!

### Step 4: Test Features

Follow the comprehensive testing guide in `ADMIN_TESTING.md` to verify all features work correctly.

## 📁 Project Structure

### Firebase Collections

```
admins/              → Admin user records
  {userId}/
    - email, name, role, createdAt

accessCodes/         → Generated access codes
  {codeId}/
    - code, type, status, generatedAt, generatedBy, usedBy, usedAt

userAccounts/        → All user accounts
  {accountId}/
    - userId, accessCode, role, status, suspensionReason, etc.

auditLogs/          → Admin action logs
  {logId}/
    - adminId, adminName, action, targetId, targetType, details, timestamp

users/              → Regular user data
  {userId}/
    - email, name, role, createdAt

courses/            → Course information
enrollments/        → Student enrollments
scheduledClasses/   → Scheduled classes
classAttendance/    → Class attendance records
```

### Key Files

```
src/
  contexts/
    AuthContext.tsx              → Authentication logic with admin support

  pages/
    AdminLogin.tsx               → Admin login page
    AdminPanel.tsx               → Admin panel container

  components/admin/
    IDGenerationTab.tsx          → Generate access codes
    IDManagementTab.tsx          → Manage access codes
    AccountManagementTab.tsx     → Manage user accounts
    AuditLogsTab.tsx            → View audit logs

  lib/
    firebase.ts                  → Firebase initialization
    accessCodeService.ts         → Access code operations
    accountManagementService.ts  → Account management operations

firestore.rules                  → Firestore security rules
```

## 🔐 Security Features

### Authentication
- Admins stored in separate `admins` collection
- Role verification at login
- Session persistence with auto-refresh
- Protected routes with automatic redirect

### Database Security
- Firestore rules enforce role-based access
- Admin operations require admin role verification
- Audit logs are immutable (cannot be edited/deleted)
- Account suspension prevents login immediately

### Audit Trail
- All admin actions are logged
- Logs include: who, what, when, why
- Logs are exportable for compliance
- Cannot be tampered with

## 🎯 Common Use Cases

### Generate Access Codes for Teachers
1. Go to **ID Generation** tab
2. Click **Generate Single Code** under Teacher Codes
3. Copy the code and share with teacher
4. Teacher uses code during signup

### Suspend a User Account
1. Go to **Accounts** tab
2. Find the user account
3. Click suspend icon (ban symbol)
4. Enter reason: "Violation of terms"
5. Click **Suspend**
6. User cannot login anymore

### View System Activity
1. Go to **Audit Logs** tab
2. See all admin actions chronologically
3. Export to CSV for records
4. Review for compliance or troubleshooting

## ⚠️ Important Notes

1. **Admin Accounts Cannot Self-Register**: Admins must be created manually in Firebase Console for security

2. **Firestore Rules are Required**: The admin panel will not work without proper Firestore rules deployed

3. **Delete vs Reset**:
   - **Reset**: Removes user data but keeps account active
   - **Delete**: Permanently removes account and all data

4. **Audit Logs are Immutable**: Once created, logs cannot be modified or deleted

5. **Suspension is Immediate**: Suspended users are logged out and cannot login

6. **No Supabase/Bolt Dependencies**: Everything uses Firebase only

## 🆘 Troubleshooting

### Issue: "Invalid admin credentials" when logging in
**Solution**:
- Verify admin document exists in `admins` collection
- Check document ID matches the authentication UID
- Ensure `role` field is exactly "admin"

### Issue: "Permission denied" errors in console
**Solution**:
- Deploy the Firestore rules from `firestore.rules`
- Verify rules are published in Firebase Console
- Check that admin document exists

### Issue: Cannot generate codes or manage accounts
**Solution**:
- Check browser console for errors
- Verify you're logged in as admin
- Ensure Firestore rules allow admin operations
- Check Firebase project quotas

### Issue: Codes not appearing in ID Management
**Solution**:
- Refresh the page
- Check that codes were generated successfully
- Verify `accessCodes` collection exists in Firestore

## 📚 Additional Resources

- **CREATE_ADMIN.md** - Step-by-step admin account creation
- **ADMIN_TESTING.md** - Comprehensive testing guide
- **FIRESTORE_RULES_DEPLOYMENT.md** - Security rules setup

## 🎊 You're All Set!

Your admin panel is production-ready with:
- ✅ Full Firebase integration
- ✅ Secure authentication
- ✅ Complete CRUD operations
- ✅ Audit logging
- ✅ Role-based access control
- ✅ No external dependencies

Start by creating your admin account and testing the features!
