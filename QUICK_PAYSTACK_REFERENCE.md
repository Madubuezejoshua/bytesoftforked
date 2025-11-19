# Paystack Payment - Quick Reference

## Quick Start

### 1. Set Environment Variables

```bash
# .env file
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_FIREBASE_FUNCTIONS_URL=https://region-projectId.cloudfunctions.net

# functions/.env file
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### 2. Deploy

```bash
# Deploy Cloud Function
cd functions
npm run build
firebase deploy --only functions

# Deploy Firestore Rules
firebase deploy --only firestore:rules
```

### 3. Use in Components

```typescript
import { courseAccessService } from '@/lib/courseAccessService';
import { EnrollmentStatus } from '@/components/courses/EnrollmentStatus';

// Check access
const access = await courseAccessService.canAccessCourse(courseId, userId);

// Show status
<EnrollmentStatus courseId={courseId} />
```

## Services Reference

### Payment Service

```typescript
import { paymentService } from '@/lib/paymentService';

// Verify payment
const result = await paymentService.verifyPaymentWithBackend(
  reference, courseId, amount
);

// Check verification status
const verified = await paymentService.checkEnrollmentVerificationStatus(
  studentId, courseId
);
```

### Course Access Service

```typescript
import { courseAccessService } from '@/lib/courseAccessService';

// Check if user can access
const canAccess = await courseAccessService.canAccessCourse(courseId, userId);

// Get access details
const info = await courseAccessService.getCurrentUserAccess(courseId);
// { hasAccess, isEnrolled, verified, paymentStatus }
```

## Paystack Test Cards

| Type | Card Number | Date | CVV |
|------|-------------|------|-----|
| Visa | 4084029410924546 | 08/50 | 852 |
| Visa Alt | 5399838383838381 | 08/50 | 852 |

## Payment Flow Summary

```
1. Student clicks "Enroll" → PaymentModal opens
2. Student clicks "Pay" → Paystack modal opens
3. Student enters card → Paystack charges
4. Success → Cloud Function verifies with Paystack
5. Verified → Enrollment record created
6. Access granted → Student can view course
```

## Database Collections

```
/payments/{paymentId}
  ├── userId
  ├── courseId
  ├── reference (Paystack)
  ├── status
  └── verifiedAt

/enrollments/{enrollmentId}
  ├── verified (NEW)
  ├── verificationMethod (NEW)
  └── ... (existing fields)

/courses/{courseId}/students/{userId}
  └── verified

/users/{userId}/enrollments/{courseId}
  └── verified
```

## Error Messages & Solutions

| Error | Fix |
|-------|-----|
| Payment verification unavailable | Add PAYSTACK_SECRET_KEY to Functions |
| Invalid token | User needs to re-login |
| Amount mismatch | Course price changed |
| Course not found | Create course before payment |
| No access | Enrollment not verified |

## Testing Flow

1. Set test credentials
2. Use test card: `4084029410924546`
3. Verify payment creates `/payments` record
4. Verify enrollment marked `verified: true`
5. Verify student can access course

## Files Location

| File | Purpose |
|------|---------|
| `src/lib/paymentService.ts` | Payment operations |
| `src/lib/courseAccessService.ts` | Access control |
| `src/components/courses/EnrollmentStatus.tsx` | Status display |
| `functions/src/index.ts` | Cloud Function |
| `firestore.rules` | Security rules |

## Common Tasks

### Protect Course Content

```typescript
const { hasAccess } = await courseAccessService.getCurrentUserAccess(courseId);
if (!hasAccess) return <EnrollmentStatus courseId={courseId} />;
return <CourseContent />;
```

### Manually Verify Enrollment (Admin)

```typescript
await updateDoc(doc(db, 'enrollments', enrollmentId), {
  verified: true,
  verificationMethod: 'manual',
  verifiedAt: new Date().toISOString(),
});
```

### Get User's Payment History

```typescript
const payments = await paymentService.getPaymentsByUser(userId);
```

## Debugging

```bash
# View Cloud Function logs
firebase functions:log

# Check Firestore rules
firebase deploy --dry-run

# Test payment locally
# Use test credentials and test cards
```

## Resources

- Paystack Docs: https://paystack.com/docs
- Firebase Functions: https://firebase.google.com/docs/functions
- Firestore Security: https://firebase.google.com/docs/firestore/security
