# Firestore Rules Deployment Guide - UPDATED

Your application requires proper Firestore security rules for signup and authentication to work correctly. Follow these steps to deploy the UPDATED rules to your Firebase project.

## ⚠️ IMPORTANT: Deploy Updated Rules

The rules have been updated to fix signup issues. You MUST deploy these new rules for signup to work.

## Deploy Firestore Rules

### Option 1: Using Firebase Console (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `lamp-study`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Copy the entire content from the `firestore.rules` file in your project
6. Paste it into the rules editor
7. Click **Publish** button

### Option 2: Using Firebase CLI (Advanced)

If you have Firebase CLI installed:

```bash
npm install -g firebase-tools
firebase login
firebase use lamp-study
firebase deploy --only firestore:rules
```

## Rules Overview

The updated rules provide secure access control for:

### Admin Operations
- ✅ Admins can create, read, update, delete access codes
- ✅ Admins can manage user accounts
- ✅ Admins can view and create audit logs
- ✅ Admin status is verified via `admins` collection

### Access Codes (`accessCodes` collection)
- ✅ All authenticated users can read codes
- ✅ Only admins can create, update, or delete codes

### User Accounts (`userAccounts` collection)
- ✅ All authenticated users can read accounts
- ✅ Users can create their own account
- ✅ Only admins can update or delete accounts

### Audit Logs (`auditLogs` collection)
- ✅ Only admins can read logs
- ✅ Only admins can create logs
- ❌ No one can update or delete logs (immutable)

### Regular User Collections
- Users: Read own data, coordinators can read all
- Courses: All can read, coordinators can create/update
- Enrollments: Students see their own, teachers/coordinators see all
- Classes: All authenticated can read, teachers/coordinators can manage
- Attendance: Students see their own, teachers/coordinators see all

## Testing Rules

After deploying rules, test them:

1. **Test Admin Access**
   - Login as admin
   - Try generating codes (should work)
   - Try viewing audit logs (should work)

2. **Test Regular User Restrictions**
   - Login as student/teacher
   - Try accessing admin panel (should fail)
   - Try accessing audit logs (should fail in console)

3. **Test Account Suspension**
   - Suspend a user account as admin
   - Try logging in as that user (should fail)

## Common Rule Errors

### Error: Missing/insufficient permissions

**Cause**: User doesn't have required role or admin status

**Solution**:
- Verify admin document exists in `admins` collection
- Ensure user document exists in `users` collection with correct role
- Check that user is authenticated

### Error: Cannot read property 'role' of undefined

**Cause**: Admin trying to use `getUserRole()` function

**Solution**: Use the updated rules that check `admins` collection directly for admin verification

## Security Best Practices

1. **Never disable security rules** - Always have rules in place
2. **Admin documents** are read-only - Only create them manually or via secure admin SDK
3. **Audit logs are immutable** - Cannot be modified or deleted once created
4. **Test in emulator** before deploying to production
5. **Regular audits** of admin actions using audit logs

## Admin Collection Structure

Ensure your admin documents follow this structure:

```javascript
admins/{userId}
  - email: "admin@example.com"
  - name: "Admin Name"
  - role: "admin"
  - createdAt: "2025-10-24T10:00:00.000Z"
```

## Backup Current Rules

Before deploying new rules, backup your current rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the current rules to a safe location
3. Deploy new rules
4. If issues occur, you can restore the backup

## Need Help?

If you encounter issues:
1. Check Firebase Console → Firestore Database → Usage tab for rule evaluation errors
2. Check browser console for detailed error messages
3. Verify admin document structure in Firestore
4. Test with Firebase Emulator Suite for safe testing
