# Paystack Payment Integration Setup

This guide explains how to set up and use the Paystack payment system with Firebase verification.

## Environment Variables

Add the following environment variables to your `.env` file:

```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
VITE_FIREBASE_FUNCTIONS_URL=https://your-project-region-your-project-id.cloudfunctions.net
```

And in your Firebase Functions `.env` (in `/functions/.env`):

```
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=your_livekit_url
```

## Getting Paystack Credentials

1. Sign up for a [Paystack account](https://paystack.com)
2. Go to Dashboard → Settings → API Keys & Webhooks
3. Copy your **Public Key** and **Secret Key**
4. Use `pk_test_*` and `sk_test_*` for testing
5. Use `pk_live_*` and `sk_live_*` for production

## Firebase Functions URL

Your Firebase Functions URL follows this pattern:
```
https://region-projectId.cloudfunctions.net
```

Example: `https://us-central1-lamp-study.cloudfunctions.net`

To find your region and project ID:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Functions
4. Check the URL of any deployed function

## Payment Flow

### 1. User Initiates Purchase

```typescript
const handleEnroll = (courseId: string) => {
  const course = courses.find(c => c.id === courseId);
  if (course) {
    setSelectedCourse(course);
    setShowPayment(true);
  }
};
```

### 2. Paystack Modal Opens

The PaymentModal component displays payment details and opens Paystack's inline payment modal.

### 3. Payment Verification

After successful Paystack payment:
1. Client receives payment reference
2. Frontend calls `verifyPaystackPayment` Cloud Function
3. Cloud Function verifies with Paystack API
4. Cloud Function validates amount and courseId
5. Payment record created in Firestore
6. Enrollment record marked as verified

### 4. Course Access

Students can access course content after:
- Payment verified
- Enrollment marked as verified
- Payment status is 'completed'

## Database Structure

### Payments Collection

```
/payments/{paymentId}
├── userId: string
├── courseId: string
├── amount: number
├── currency: 'NGN'
├── reference: string (Paystack reference)
├── status: 'completed' | 'pending' | 'failed'
├── verifiedAt: timestamp
├── createdAt: timestamp
└── metadata:
    ├── courseTitle: string
    └── userName: string
```

### Enrollments Collection

Updated fields for verification:
```
/enrollments/{enrollmentId}
├── verified: boolean (marks enrollment as verified)
├── verificationMethod: 'automatic' | 'manual' | null
├── ... (existing fields)
```

### Course Students Subcollection

```
/courses/{courseId}/students/{userId}
├── userId: string
├── enrolledAt: timestamp
├── verified: boolean
```

### User Enrollments Subcollection

```
/users/{userId}/enrollments/{courseId}
├── courseId: string
├── courseName: string
├── enrolledAt: timestamp
├── verified: boolean
```

## Checking Course Access

Use the `courseAccessService` to check if a user can access a course:

```typescript
import { courseAccessService } from '@/lib/courseAccessService';

// Check if user can access course
const canAccess = await courseAccessService.canAccessCourse(
  courseId,
  userId
);

// Get detailed access info
const accessInfo = await courseAccessService.getCurrentUserAccess(courseId);
// Returns:
// {
//   hasAccess: boolean,
//   isEnrolled: boolean,
//   verified: boolean,
//   paymentStatus: string | null
// }
```

## Protecting Course Content

In components that display course content, add verification checks:

```typescript
import { courseAccessService } from '@/lib/courseAccessService';
import { useAuth } from '@/contexts/AuthContext';

const CourseMaterial = ({ courseId }: { courseId: string }) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (user?.id) {
        const access = await courseAccessService.canAccessCourse(
          courseId,
          user.id
        );
        setHasAccess(access);
      }
    };
    checkAccess();
  }, [courseId, user?.id]);

  if (!hasAccess) {
    return (
      <div className="p-6 text-center">
        <p>You must enroll and complete payment to access this course.</p>
        <Button onClick={() => navigate('/courses')}>
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Course content */}
    </div>
  );
};
```

## Security Rules

The Firestore rules enforce:

1. **Payments Collection**: Only Cloud Functions can create/write
2. **Verified Enrollments**: Only through verified payment flow
3. **Course Access**: Students can only read their own verified enrollments
4. **Payment Visibility**:
   - Users can only see their own payments
   - Coordinators can see all payments for verification

## Debugging

### Check Payment Verification Logs

In Firebase Console:
1. Go to Functions → Logs
2. Search for "Payment verified" or error messages
3. Check timestamps and user IDs

### Test Payment (Development)

Use Paystack test cards:
- **Successful**: 4084029410924546 (visa), 08/50, 852
- **Failed**: 4111111111111111, 08/50, 852

### Troubleshooting

**"Payment verification service unavailable"**
- Check PAYSTACK_SECRET_KEY is set in Functions environment

**"Payment gateway error"**
- Verify PAYSTACK_SECRET_KEY is correct
- Check Paystack API is accessible
- Review Cloud Function logs

**"Amount mismatch"**
- Ensure course price matches payment amount
- Client sends amount in NGN, Function multiplies by 100 for kobo

**"Course not found"**
- Course must exist in Firestore before payment
- Verify courseId is correct

## Manual Payment Verification (Admin)

Coordinators can manually verify enrollments if automatic verification fails:

1. Search enrollment by code
2. Verify payment details manually
3. Mark as verified in admin panel
4. Update verification method to 'manual'

## Testing the Complete Flow

1. Create a test course with a price
2. Log in as student
3. Navigate to course catalog
4. Click "Enroll" on a course
5. Complete payment with test card
6. Verify enrollment is marked as verified
7. Check /payments collection has new record
8. Verify student can now access course content
