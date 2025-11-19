# Coordinator Course Details - Quick Start Guide

## What's New?

Coordinators can now view detailed course information on a dedicated full-page view instead of a modal dialog.

## How to Access

1. Go to **Coordinator Dashboard**
2. Click **Manage Courses** tab
3. Find a course and click **View Details** button
4. Browse comprehensive course information

## What You'll See

### Four Main Sections (Tabs)

#### 🧑‍🏫 Teachers Tab
- List of all teachers assigned to the course
- Profile pictures, names, and emails
- Join date for each teacher

#### 👥 Students Tab
- All enrolled students in the course
- Student names and emails
- Enrollment codes
- Enrollment dates
- Verification status (Verified/Pending)

#### 📹 Classes Tab
- Total count of completed classes
- List of all class sessions held
- Class titles and dates
- Number of participants in each class

#### ⭐ Reviews Tab
- Select a teacher to view their reviews
- See all reviews from coordinators and students
- Submit your own coordinator reviews
- View and manage review ratings

## Key Features

✅ **Breadcrumb Navigation** - Know where you are
✅ **Back Button** - Easy navigation back to dashboard
✅ **Statistics Cards** - Quick overview of totals
✅ **Responsive Design** - Works on mobile and desktop
✅ **Searchable Data** - Tables work well on all devices

## Quick Tips

- Use the tabs to organize information by category
- Click on any teacher name in the Reviews section to see their reviews
- Hover over elements for visual feedback
- Use the back button to return to course management

## Firestore Notes

All data access is secure and uses existing Firebase permissions:
- Your role (coordinator) is verified before showing data
- Data is fetched from course subcollections
- Review submissions are tracked with your coordinator ID
- No data outside your permission level is displayed

## File Locations

- **Page Component**: `src/pages/CoordinatorCourseDetailsPage.tsx`
- **Route**: Added in `src/App.tsx`
- **Documentation**: `COORDINATOR_COURSE_DETAILS_IMPLEMENTATION.md`
- **Firestore Rules**: Verified in `COORDINATOR_COURSE_DETAILS_FIRESTORE_RULES.md`

---

**Status**: Ready to Use
**Build**: Passing ✅
