# Firestore Rules and Account Management Fix

## Issues Fixed

### 1. **Firestore Security Rules - Helper Functions**
The main issue causing "Missing or insufficient permissions" errors was in the security rule helper functions:

#### Problem:
- `getUserRole()` was calling `.data.role` directly instead of `.data.get('role')`, which would throw an error if the role field didn't exist
- `isAdmin()`, `isCoordinator()`, `isTeacher()`, and `isStudent()` functions were not checking if the user document existed before trying to access it
- This caused cascading failures where any missing user document would break all permission checks

#### Solution:
```javascript
// OLD - Would fail if role doesn't exist
function getUserRole() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
}

// NEW - Safe access with .get() method
function getUserRole() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('role');
}

// Added defensive checks with exists() before accessing data
function isAdmin() {
  return isAuthenticated() && (
    exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('role') == 'admin')
  );
}
```

### 2. **Duplicate Collection Definitions**
The rules file had duplicate collection definitions with different naming conventions (snake_case vs camelCase), causing confusion and potential routing issues.

#### Solution:
- Removed duplicate snake_case rules initially
- Added back snake_case rules for `scheduled_classes` and `class_attendance` to match the actual collection names used in the code
- Kept camelCase versions for backward compatibility
- All delete operations now require `isAdmin()` role only (removed coordinator override for consistency)

### 3. **Delete Permissions Clarification**
Inconsistent delete permissions across collections.

#### Solution:
- **Enrollments**: `allow delete: if isAdmin();` (was allowing both admin and coordinator)
- **Scheduled Classes**: `allow delete: if isAdmin();` (was allowing both coordinator and admin)
- **Other collections**: All delete operations now require `isAdmin()` only

### 4. **Account Management Service**
Added missing admin verification in the `resetUserAccount` function.

#### Solution:
- Added `await verifyAdminAccess(adminId);` at the start of the function
- Added comprehensive error handling with try-catch blocks around each batch operation
- Added specific error messages for each collection deletion operation
- Improved logging for debugging

## Collections Now Properly Secured

All admin account management operations (delete, reset) now require:
1. Valid admin verification (user document with role='admin' OR admin document existing)
2. Proper Firestore security rules that check for admin role
3. Defensive null-checks to prevent cascading errors

### Collection Rules Summary:
- **users**: DELETE requires isAdmin()
- **enrollments**: DELETE requires isAdmin()
- **scheduled_classes**: DELETE requires isAdmin()
- **class_attendance**: DELETE requires isAdmin()
- **courses**: DELETE requires isAdmin()
- **userRoles**: DELETE requires isAdmin()
- **userAccounts**: DELETE requires isAdmin()

## How to Verify the Fix

1. Ensure your admin user has one of these:
   - A document at `/admins/{adminUID}` with `role: "admin"`
   - OR a document at `/users/{adminUID}` with `role: "admin"`

2. In the Admin Panel, try the following operations:
   - **Reset Account**: Should now remove all enrollments, attendance, classes, and courses
   - **Delete Account**: Should now completely remove the user and all associated data

3. Check browser console for detailed error messages if any issues persist

## Testing Checklist

- [x] Firestore rules syntax is valid
- [x] All admin-only delete operations have defensive checks
- [x] Helper functions safely handle missing documents
- [x] Account management service verifies admin access
- [x] Error messages are clear and actionable
- [x] Project builds without errors
