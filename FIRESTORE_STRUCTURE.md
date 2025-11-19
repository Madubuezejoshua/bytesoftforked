# Firestore Structure and Security Rules Documentation

## Overview

This document defines the complete Firestore database structure, security rules, and data access patterns for the Learning Management System (LMS).

---

## Collection Schemas

### 1. Users Collection

**Path**: `/users/{userId}`

**Purpose**: Stores user profile information and role-based access control

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Firebase Auth UID (document ID) |
| email | string | Yes | User email address |
| name | string | Yes | User display name |
| role | string | Yes | User role: 'student', 'teacher', 'coordinator', 'admin' |
| createdAt | string | Yes | ISO timestamp of account creation |
| profilePicture | string | No | URL to user profile image |
| updatedAt | string | No | ISO timestamp of last update |

**Access Patterns**:
- Users can read their own data
- Coordinators can read all users (filtered by role)
- Teachers can read other teachers' basic info (name, id)
- Admins can read all user data

**Queries**:
- Get user by ID: `doc(db, 'users', userId)`
- Get all teachers: `query(collection(db, 'users'), where('role', '==', 'teacher'))`
- Get all students: `query(collection(db, 'users'), where('role', '==', 'student'))`

**Index**: Single field index on `role`

---

### 2. Courses Collection

**Path**: `/courses/{courseId}`

**Purpose**: Stores course information and metadata

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique course identifier (document ID) |
| title | string | Yes | Course title |
| description | string | Yes | Course description |
| category | string | Yes | Course category |
| price | number | Yes | Course price |
| currency | string | Yes | Currency code ('NGN') |
| duration | string | Yes | Course duration (e.g., '8 weeks') |
| level | string | Yes | Course level: 'beginner', 'intermediate', 'advanced' |
| thumbnailUrl | string | Yes | URL to course thumbnail image |
| instructorIds | array | Yes | Array of teacher IDs |
| instructorNames | array | Yes | Array of teacher names |
| isActive | boolean | Yes | Course active status |
| createdAt | string | Yes | ISO timestamp of creation |
| updatedAt | string | Yes | ISO timestamp of last update |
| enrollmentCount | number | Yes | Total enrolled students |

**Access Patterns**:
- All authenticated users can read courses
- Only coordinators can create/update courses
- Only admins can delete courses

**Queries**:
- Get course by ID: `doc(db, 'courses', courseId)`
- Get teacher courses: `query(collection(db, 'courses'), where('instructorIds', 'array-contains', teacherId))`
- Get courses by category: `query(collection(db, 'courses'), where('category', '==', category), where('isActive', '==', true))`

---

### 3. Enrollments Collection

**Path**: `/enrollments/{enrollmentId}`

**Purpose**: Records student enrollment in courses

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique enrollment identifier (document ID) |
| studentId | string | Yes | Firebase UID of enrolled student |
| studentName | string | Yes | Name of enrolled student |
| studentEmail | string | Yes | Email of enrolled student |
| courseId | string | Yes | Reference to course |
| courseName | string | Yes | Name of course |
| teacherId | string | Yes | Primary teacher for this course |
| enrollmentCode | string | Yes | Unique enrollment code |
| paymentStatus | string | Yes | Payment status: 'pending', 'completed', 'failed' |
| paymentReference | string | Yes | Payment transaction reference |
| amount | number | Yes | Enrollment amount paid |
| enrolledAt | string | Yes | ISO timestamp of enrollment |
| verifiedAt | string | No | ISO timestamp of verification |
| verifiedBy | string | No | Coordinator ID who verified |

**Access Patterns**:
- Students can read their own enrollments
- Teachers can read enrollments for their courses
- Coordinators can read all enrollments
- Admins can read/delete enrollments

**Queries**:
- Get student enrollments: `query(collection(db, 'enrollments'), where('studentId', '==', studentId), orderBy('enrolledAt', 'desc'))`
- Get teacher enrollments: `query(collection(db, 'enrollments'), where('teacherId', '==', teacherId))`
- Get course enrollments: `query(collection(db, 'enrollments'), where('courseId', '==', courseId))`

**Indexes**:
- Composite: (studentId, enrolledAt DESC)
- Single: teacherId

---

### 4. Scheduled Classes Collection

**Path**: `/scheduled_classes/{classId}`

**Purpose**: Records scheduled class sessions

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique class identifier (document ID) |
| courseId | string | Yes | Reference to course |
| courseName | string | Yes | Course name |
| teacherId | string | Yes | Teacher conducting the class |
| teacherName | string | Yes | Teacher name |
| title | string | Yes | Class title/topic |
| description | string | Yes | Class description |
| classType | string | Yes | Class type: 'physical', 'online' |
| meetingLink | string | No | Video meeting link for online classes |
| location | string | No | Physical location for in-person classes |
| startTime | string | Yes | ISO timestamp of start time |
| endTime | string | Yes | ISO timestamp of end time |
| maxStudents | number | Yes | Maximum student capacity |
| enrolledStudents | array | Yes | Array of enrolled student IDs |
| createdAt | string | Yes | ISO timestamp of creation |
| status | string | Yes | Status: 'scheduled', 'ongoing', 'completed', 'cancelled' |

**Access Patterns**:
- All authenticated users can read scheduled classes
- Teachers and coordinators can create/update classes
- Only admins can delete classes

**Queries**:
- Get teacher classes: `query(collection(db, 'scheduled_classes'), where('teacherId', '==', teacherId), orderBy('startTime', 'desc'))`
- Get course classes: `query(collection(db, 'scheduled_classes'), where('courseId', '==', courseId), orderBy('startTime', 'desc'))`
- Get upcoming classes: `query(collection(db, 'scheduled_classes'), where('startTime', '>', now), orderBy('startTime', 'asc'))`

**Index**: Composite: (teacherId, startTime DESC)

---

### 5. Teacher Reviews Collection

**Path**: `/teacher_reviews/{reviewId}`

**Purpose**: Stores reviews of teachers from coordinators and students

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique review identifier (document ID) |
| courseId | string | Yes | Course being reviewed |
| teacherId | string | Yes | Teacher being reviewed |
| studentId | string | No | Student reviewer (if reviewerType is 'student') |
| studentName | string | No | Name of student reviewer |
| coordinatorId | string | No | Coordinator reviewer (if reviewerType is 'coordinator') |
| coordinatorName | string | No | Name of coordinator reviewer |
| reviewerType | string | Yes | Reviewer type: 'student', 'coordinator' |
| rating | number | Yes | Rating (1-5 scale) |
| comment | string | Yes | Review comment |
| createdAt | string | Yes | ISO timestamp of review creation |

**Access Patterns**:
- **Coordinators & Admins**: Can read all reviews
- **Teachers**: Can read reviews about themselves
- **Students**: Can read all reviews (UI filters as needed)
- **Only Coordinators**: Can create coordinator reviews
- **Only Students**: Can create student reviews
- **Only Admins**: Can update or delete reviews

**Queries**:
- Get all teacher reviews: `query(collection(db, 'teacher_reviews'), where('teacherId', '==', teacherId), orderBy('createdAt', 'desc'))`
- Get coordinator reviews: `query(collection(db, 'teacher_reviews'), where('teacherId', '==', teacherId), where('reviewerType', '==', 'coordinator'), orderBy('createdAt', 'desc'))`
- Get student reviews: `query(collection(db, 'teacher_reviews'), where('teacherId', '==', teacherId), where('reviewerType', '==', 'student'), orderBy('createdAt', 'desc'))`
- Get reviews by coordinator: `query(collection(db, 'teacher_reviews'), where('coordinatorId', '==', coordinatorId), where('reviewerType', '==', 'coordinator'), orderBy('createdAt', 'desc'))`

**Indexes**:
- Composite: (teacherId, reviewerType)
- Composite: (teacherId, createdAt DESC)
- Composite: (coordinatorId, createdAt DESC)

---

## Security Rules

### Role-Based Access Control

The security rules enforce a hierarchical access model:

**Roles (from lowest to highest privilege)**:
1. **Student**: Can access only their own data
2. **Teacher**: Can access their own data and limited data for course management
3. **Coordinator**: Can access all teachers and students, manage reviews
4. **Admin**: Full access to all data

### Helper Functions

```firestore
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function isAdmin() {
  return isAuthenticated() && (
    exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
  );
}

function isCoordinator() {
  return isAuthenticated() && (
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coordinator') ||
    isAdmin()
  );
}

function isTeacher() {
  return isAuthenticated() && (
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher') ||
    isAdmin()
  );
}

function isStudent() {
  return isAuthenticated() && (
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student'
  );
}
```

### Collection-Specific Rules

#### Users Collection
- **READ**: Own data OR Coordinator/Admin
- **CREATE**: Authenticated users can create own document
- **UPDATE**: Own data OR Admin
- **DELETE**: Admin only

#### Courses Collection
- **READ**: All authenticated users
- **CREATE/UPDATE**: Coordinator or Admin
- **DELETE**: Admin only

#### Enrollments Collection
- **READ**: Own enrollments OR Coordinator/Teacher/Admin
- **CREATE**: Authenticated users
- **UPDATE**: Coordinator/Admin
- **DELETE**: Admin only

#### Scheduled Classes Collection
- **READ**: All authenticated users
- **CREATE/UPDATE**: Teacher or Coordinator
- **DELETE**: Admin only

#### Teacher Reviews Collection
- **READ**:
  - Coordinators and Admins: All reviews
  - Teachers: Reviews about themselves
  - Students: All reviews
- **CREATE**:
  - Coordinators: Only coordinator reviews (must own the coordinatorId)
  - Students: Only student reviews (must own the studentId)
- **UPDATE/DELETE**: Admin only

---

## Indexes

Composite indexes are configured for optimal query performance:

| Collection | Fields | Purpose |
|-----------|--------|---------|
| users | role | Filter by role |
| enrollments | (studentId, enrolledAt DESC) | Get student enrollments sorted by date |
| enrollments | teacherId | Get all enrollments for teacher |
| scheduled_classes | (teacherId, startTime DESC) | Get teacher's classes sorted by date |
| teacher_reviews | (teacherId, reviewerType) | Filter reviews by teacher and type |
| teacher_reviews | (teacherId, createdAt DESC) | Get reviews sorted by creation date |
| teacher_reviews | (coordinatorId, createdAt DESC) | Get coordinator's reviews sorted by date |

---

## Data Service Layer

All database access goes through typed service modules for consistency and security:

### Available Services

1. **userDataService.ts** - User data access with role-based filtering
   - `getCurrentUserRole()`
   - `getOwnUserData()`
   - `getAllTeachers()`
   - `getAllStudents()`
   - `getUserById(userId)`
   - `searchUsersByName(searchTerm, role?)`

2. **enrollmentDataService.ts** - Enrollment data access
   - `getStudentEnrollments(studentId)`
   - `getTeacherEnrollments(teacherId)`
   - `getCourseEnrollments(courseId)`
   - `getOwnEnrollments()`
   - `getStudentsByCourseAndTeacher(courseId, teacherId)`
   - `countStudentsInCourse(courseId)`

3. **reviewService.ts** - Review data access with coordinator restrictions
   - `getTeacherAllReviews(teacherId)`
   - `getCoordinatorReviews(teacherId)`
   - `getStudentReviews(teacherId)`
   - `getReviewsByCoordinator(coordinatorId)`
   - `createCoordinatorReview(...)` - Coordinator only
   - `createStudentReview(...)`
   - `getAverageRating(reviews)`
   - `getCoordinatorAverageRating(reviews)`
   - `getStudentAverageRating(reviews)`

4. **scheduledClassService.ts** - Class scheduling access
   - `getTeacherScheduledClasses(teacherId)`
   - `getCourseScheduledClasses(courseId)`
   - `getScheduledClassById(classId)`
   - `getUpcomingScheduledClasses(teacherId?)`
   - `getPastScheduledClasses(teacherId?)`
   - `filterClassesByStatus(classes, status)`

5. **courseDataService.ts** - Course data access
   - `getTeacherCourses(teacherId)`
   - `getCourseById(courseId)`
   - `getAllCourses()`
   - `getCoursesByCategory(category)`
   - `getCoursesByLevel(level)`
   - `searchCourses(searchTerm)`
   - `getCoursesForCoordinator()`

---

## Implementation Guidelines

### Using the Services

All data access must go through the service layer:

```typescript
import { userDataService } from '@/lib/userDataService';
import { reviewService } from '@/lib/reviewService';
import { enrollmentDataService } from '@/lib/enrollmentDataService';

// Get current user's role
const role = await userDataService.getCurrentUserRole();

// Get all teachers (coordinator only enforced by UI/rules)
const teachers = await userDataService.getAllTeachers();

// Get reviews for a teacher
const reviews = await reviewService.getTeacherAllReviews(teacherId);

// Create a coordinator review (only coordinators can call this)
const reviewId = await reviewService.createCoordinatorReview(
  teacherId,
  courseId,
  coordinatorId,
  coordinatorName,
  rating,
  comment
);

// Get student enrollments
const enrollments = await enrollmentDataService.getOwnEnrollments();
```

### Security Validation

The security rules handle authorization at the database level:

1. **Unauthenticated requests** are blocked automatically
2. **Role mismatches** are caught by security rules (e.g., students cannot create coordinator reviews)
3. **Ownership violations** are prevented (e.g., users cannot modify others' data)
4. **Permission-denied errors** are thrown by the client SDK when rules reject operations

### Error Handling

Always handle potential permission errors:

```typescript
try {
  const reviews = await reviewService.getTeacherAllReviews(teacherId);
} catch (error) {
  if (error.code === 'permission-denied') {
    console.error('You do not have permission to access this data');
  } else {
    console.error('Error fetching reviews:', error);
  }
}
```

---

## Data Validation Rules

### Required Field Validation
- All fields marked as "Required: Yes" must be present when creating/updating documents
- Fields marked as "No" are optional

### Type Validation
- `role` must be one of: 'student', 'teacher', 'coordinator', 'admin'
- `rating` must be a number between 1-5
- `paymentStatus` must be one of: 'pending', 'completed', 'failed'
- `classType` must be one of: 'physical', 'online'
- `status` must be one of: 'scheduled', 'ongoing', 'completed', 'cancelled'

### Length Validation
- `name`: Max 255 characters
- `email`: Max 255 characters, must be valid email
- `comment`: Max 5000 characters
- `title`: Max 255 characters
- `description`: Max 5000 characters

---

## Deployment Checklist

Before deploying security rules to production:

- [ ] All rules have been tested in the Firebase emulator
- [ ] Indexes are created in the Firebase console
- [ ] Role-based access has been verified for each user type
- [ ] Permission-denied scenarios have been tested
- [ ] Data ownership is properly enforced
- [ ] Review creation is restricted to appropriate roles
- [ ] TypeScript compilation passes without errors
- [ ] All service functions handle errors appropriately
- [ ] Sensitive data fields are properly restricted
- [ ] Backup of existing rules has been created

---

## Testing Coordinator Review Restrictions

To verify that only coordinators can create reviews:

**Test 1: Coordinator can create review**
```typescript
const coordinatorId = 'coordinator-uid-123';
const result = await reviewService.createCoordinatorReview(
  'teacher-123',
  'course-456',
  coordinatorId,
  'John Coordinator',
  5,
  'Excellent teaching!'
);
// Expected: Success, review created
```

**Test 2: Student cannot create coordinator review**
```typescript
// Student tries to create coordinator review
// Security rules will reject with permission-denied error
```

**Test 3: Teacher cannot create coordinator review**
```typescript
// Teacher tries to create coordinator review
// Security rules will reject with permission-denied error
```

---

## Monitoring and Maintenance

### Log Important Events
- Review creation attempts (especially unauthorized)
- Bulk data access by coordinators
- Role changes for users
- Failed authorization attempts

### Regular Audits
- Review security rules monthly
- Check index usage in Firebase console
- Verify no permission-denied errors in production logs
- Audit coordinator review creation patterns

### Scalability Considerations
- Each collection can handle millions of documents
- Indexes prevent slow queries
- Service layer can be extended with caching if needed
- Consider archiving old reviews after 2 years

---

*Last Updated: 2025-01-11*
*Version: 1.0*
*Status: Production Ready*
