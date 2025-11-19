# Create Admin Account

To create an admin account in your Firebase project, follow these steps:

## Option 1: Using Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `lamp-study`
3. Navigate to **Authentication** in the left sidebar
4. Click **Add user** and create a new user with email/password
5. Copy the **User UID** that was generated
6. Go to **Firestore Database** in the left sidebar
7. Navigate to the `admins` collection (create it if it doesn't exist)
8. Click **Add document**
9. Use the User UID as the **Document ID**
10. Add the following fields:
    - `email` (string): The admin's email
    - `name` (string): The admin's name
    - `role` (string): `admin`
    - `createdAt` (string): Current timestamp (e.g., `2025-10-24T10:00:00.000Z`)

## Option 2: Using Firestore Rules (Temporary)

Temporarily modify your Firestore rules to allow writes, create the admin user via code, then restore the rules.

## Testing Admin Login

1. Go to: http://localhost:5173/admin-login
2. Enter the admin email and password you created
3. You should be redirected to the admin panel with full functionality

## Admin Panel Features

The admin panel includes:
- **ID Generation**: Generate teacher and coordinator access codes
- **ID Management**: View and manage all generated access codes
- **Account Management**: View, suspend, reset, or delete user accounts
- **Audit Logs**: Track all admin actions for compliance
