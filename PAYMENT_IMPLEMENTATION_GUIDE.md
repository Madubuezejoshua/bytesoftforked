# Payment Implementation Guide

## Overview

The Paystack payment system is now fully integrated with Firebase verification. This guide explains how to use the payment services in your application.

## Key Components

### 1. Payment Verification Service

Located in: `src/lib/paymentService.ts`

This service handles all payment-related operations:

```typescript
// Verify payment with backend
const result = await paymentService.verifyPaymentWithBackend(
  reference,
  courseId,
  amount
);

// Create enrollment record
await paymentService.createEnrollmentRecord(
  courseId,
  courseName,
  coursePrice,
  paymentReference,
  enrollmentCode,
  verified
);

// Add student to course lists
await paymentService.addStudentToCourseLists(
  userId,
  courseId,
  courseName
);

// Update course enrollment count
await paymentService.updateCourseEnrollmentCount(courseId);

// Check enrollment verification status
const isVerified = await paymentService.checkEnrollmentVerificationStatus(
  studentId,
  courseId
);
```

### 2. Course Access Service

Located in: `src/lib/courseAccessService.ts`

This service checks if users can access courses:

```typescript
// Check if user can access course
const canAccess = await courseAccessService.canAccessCourse(
  courseId,
  userId
);

// Check if user is enrolled (without verification check)
const isEnrolled = await courseAccessService.isEnrolledInCourse(
  courseId,
  userId
);

// Get detailed access information
const accessInfo = await courseAccessService.getCurrentUserAccess(courseId);
// Returns: { hasAccess, isEnrolled, verified, paymentStatus }
```

### 3. Cloud Function

Located in: `functions/src/index.ts` - `verifyPaystackPayment()`

This function:
- Verifies Firebase authentication
- Validates payment reference with Paystack API
- Checks amount matches course price
- Creates payment record in Firestore
- Returns payment ID for enrollment linkage

## Payment Flow Diagram

```
1. Student clicks "Enroll"
   ↓
2. PaymentModal opens with course details
   ↓
3. Student clicks "Pay" button
   ↓
4. Paystack inline modal opens
   ↓
5. Student enters payment details
   ↓
6. Paystack processes payment
   ↓
7. On success, callback to handlePaymentSuccess()
   ↓
8. Frontend calls Cloud Function with reference
   ↓
9. Cloud Function verifies with Paystack API
   ↓
10. Cloud Function creates payment record in /payments
    ↓
11. Frontend creates enrollment record in /enrollments
    ↓
12. Frontend adds student to /courses/{courseId}/students/{userId}
    ↓
13. Frontend adds enrollment to /users/{userId}/enrollments/{courseId}
    ↓
14. Success! Student now has verified access
```

## Implementation Checklist

### Required Environment Variables

Add to `.env`:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_FIREBASE_FUNCTIONS_URL=https://region-projectId.cloudfunctions.net
```

Add to `functions/.env`:
```
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### Updated Type Definitions

The `Payment` and `Enrollment` types now include:
- `verified: boolean` - Marks enrollment as verified
- `verificationMethod: 'automatic' | 'manual' | null` - How enrollment was verified
- `Payment` interface - New payment tracking structure

### Updated Firestore Rules

New collections and subcollections:
- `/payments/{paymentId}` - Stores all payment records
- `/courses/{courseId}/students/{userId}` - Student enrollment in course
- `/users/{userId}/enrollments/{courseId}` - User's course enrollment

### Using EnrollmentStatus Component

Display payment verification status in course pages:

```typescript
import { EnrollmentStatus } from '@/components/courses/EnrollmentStatus';

<EnrollmentStatus courseId={courseId} />
```

Shows appropriate messages for:
- ✓ Verified enrollment (full access)
- ⏳ Payment pending verification
- ✗ Payment verification failed
- ⚠ Payment status issue

## Protecting Course Content

### Example: Course Page with Access Control

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { courseAccessService } from '@/lib/courseAccessService';
import { EnrollmentStatus } from '@/components/courses/EnrollmentStatus';

const CourseContentPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        navigate('/login');
        return;
      }

      const access = await courseAccessService.canAccessCourse(
        courseId!,
        user.id
      );
      setHasAccess(access);
      setLoading(false);
    };

    checkAccess();
  }, [courseId, user?.id, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="p-6">
        <EnrollmentStatus courseId={courseId!} />
        <Button onClick={() => navigate('/courses')}>
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Course content - videos, materials, etc. */}
    </div>
  );
};
```

### Example: Student Dashboard Enhancement

```typescript
import { useEffect, useState } from 'react';
import { courseAccessService } from '@/lib/courseAccessService';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadEnrollments = async () => {
      // Load existing enrollments
      const enrollmentsList = await getEnrollments();
      setEnrollments(enrollmentsList);

      // Check access for each
      const map: Record<string, boolean> = {};
      for (const enrollment of enrollmentsList) {
        map[enrollment.courseId] = await courseAccessService.canAccessCourse(
          enrollment.courseId,
          user.id
        );
      }
      setAccessMap(map);
    };

    loadEnrollments();
  }, []);

  return (
    <div>
      {enrollments.map(enrollment => (
        <EnrolledCourseCard
          key={enrollment.id}
          enrollment={enrollment}
          hasAccess={accessMap[enrollment.courseId] || false}
          onEnter={() => {
            if (accessMap[enrollment.courseId]) {
              navigate(`/course/${enrollment.courseId}/content`);
            }
          }}
        />
      ))}
    </div>
  );
};
```

## Payment Verification States

### Automatic Verification (Default)

When payment is successfully verified by the Cloud Function:
- `verified: true`
- `verificationMethod: 'automatic'`
- `verifiedAt: timestamp`
- `paymentStatus: 'completed'`

Student immediately has access to course content.

### Manual Verification (Admin)

For edge cases where automatic verification fails:

```typescript
// In AdminPanel or CoordinatorDashboard
const manuallyVerifyEnrollment = async (enrollmentId: string) => {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    verified: true,
    verificationMethod: 'manual',
    verifiedAt: new Date().toISOString(),
    verifiedBy: coordinatorId,
  });
};
```

## Testing Payment Flow

### Test Mode (Development)

Use Paystack test credentials:
- Public Key: `pk_test_...`
- Secret Key: `sk_test_...`

Test card numbers:
- Visa: `4084029410924546`, 08/50, 852
- Visa 2: `5399838383838381`, 08/50, 852

### Production Mode

- Update to live credentials: `pk_live_...`, `sk_live_...`
- Test with small amount before full launch
- Monitor Cloud Function logs for errors

### Debugging Checklist

1. ✓ Verify PAYSTACK_SECRET_KEY is set in Functions environment
2. ✓ Check VITE_FIREBASE_FUNCTIONS_URL is correct
3. ✓ Ensure Cloud Function is deployed
4. ✓ Review Firestore rules - payments should be writable only by functions
5. ✓ Check Firebase Auth token is valid
6. ✓ Verify course exists before payment
7. ✓ Check Firestore rules for enrollments collection
8. ✓ Review Cloud Function logs for errors

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Payment verification service unavailable | PAYSTACK_SECRET_KEY not set | Add key to Functions environment |
| Invalid token | Firebase token expired | User needs to re-authenticate |
| Amount mismatch | Price changed | Verify course price unchanged |
| Course not found | Course deleted/archived | Check courseId is correct |
| Payment gateway error | Paystack API unreachable | Check internet connection |

### User-Facing Messages

```typescript
if (!verification.verified) {
  toast.error(
    verification.error ||
    'Payment verification failed. Please try again.'
  );
}
```

## Security Considerations

### Frontend Security

- Payment references are verified server-side
- Client-side code doesn't handle secrets
- Firebase Auth required for all operations
- RLS prevents unauthorized access

### Backend Security

- PAYSTACK_SECRET_KEY never exposed to client
- Firebase Admin SDK used for verification
- Payment records created only by Cloud Function
- Timestamp verification prevents replay attacks

### Database Security

- Payments collection: Only Cloud Functions can write
- Enrollments: Users can only read own records
- Students subcollection: Restricted by verified status
- All RLS policies require authentication

## Migration from Old Payment System

If you had a previous payment implementation:

1. Update Enrollment type with new fields
2. Add Payment type to types definition
3. Deploy new Cloud Function
4. Update Firestore rules
5. Update PaymentModal component
6. Test with test payments
7. Update existing enrollment records (if needed):

```typescript
// One-time migration script
const migrateEnrollments = async () => {
  const enrollments = await getDocs(collection(db, 'enrollments'));

  for (const doc of enrollments.docs) {
    if (!('verified' in doc.data())) {
      await updateDoc(doc.ref, {
        verified: doc.data().paymentStatus === 'completed',
        verificationMethod: 'manual',
      });
    }
  }
};
```

## Coordinator Verification Panel

Coordinators can verify enrollments manually if needed:

```typescript
const CoordinatorVerificationPanel = () => {
  const handleVerify = async (enrollmentId: string, enrollmentData: any) => {
    // Backend verification via coordinator endpoint
    await verifyEnrollment(enrollmentId, enrollmentData);
    toast.success('Enrollment verified manually');
  };

  return (
    // Search and verify enrollments
  );
};
```

## Next Steps

1. Set environment variables
2. Deploy Cloud Function: `npm run deploy` (in functions/)
3. Deploy Firestore rules: `firebase deploy --only firestore:rules`
4. Test payment flow with test credentials
5. Add EnrollmentStatus to course pages
6. Update course content pages with access checks
7. Monitor Cloud Function logs for issues
8. Switch to production credentials when ready
