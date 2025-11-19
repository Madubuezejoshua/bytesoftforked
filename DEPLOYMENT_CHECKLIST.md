# Paystack Payment Integration - Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Create `.env` file in project root (if not exists)
- [ ] Create `functions/.env` file in functions directory (if not exists)
- [ ] Add to `.env`:
  ```
  VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx (test) or pk_live_xxxxx (prod)
  VITE_FIREBASE_FUNCTIONS_URL=https://region-projectId.cloudfunctions.net
  ```
- [ ] Add to `functions/.env`:
  ```
  PAYSTACK_SECRET_KEY=sk_test_xxxxx (test) or sk_live_xxxxx (prod)
  LIVEKIT_API_KEY=xxx
  LIVEKIT_API_SECRET=xxx
  LIVEKIT_URL=xxx
  ```

### Code Review
- [ ] Review `src/lib/paymentService.ts` - Payment operations
- [ ] Review `src/lib/courseAccessService.ts` - Access control
- [ ] Review `functions/src/index.ts` - Cloud Function implementation
- [ ] Review `firestore.rules` - Security rules
- [ ] Verify `src/types/index.ts` - Type definitions
- [ ] Review `src/components/courses/PaymentModal.tsx` - Payment flow

### Testing
- [ ] Run `npm run build` - No errors
- [ ] Test payment flow with test card
- [ ] Verify enrollment created in Firestore
- [ ] Verify payment record in `/payments` collection
- [ ] Verify student can access course after payment
- [ ] Test failed payment scenario
- [ ] Check Cloud Function logs

## Deployment Steps

### Step 1: Deploy Cloud Function
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```
- [ ] Verify function deployed successfully
- [ ] Check function URL in Firebase Console
- [ ] Confirm PAYSTACK_SECRET_KEY set in environment
- [ ] Test function with manual request

### Step 2: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```
- [ ] Verify rules deployed
- [ ] Confirm `/payments` collection rules active
- [ ] Confirm subcollection rules active

### Step 3: Build and Deploy Frontend
```bash
npm run build
```
- [ ] Verify build succeeds with no errors
- [ ] Check bundle size is reasonable
- [ ] Deploy to hosting (if applicable)

## Post-Deployment Testing

### Payment Flow Testing
- [ ] Complete test payment with Paystack test card
- [ ] Verify payment record created in `/payments`
- [ ] Verify enrollment marked as verified
- [ ] Verify student access to course content
- [ ] Check Cloud Function logs for success message

### Error Scenario Testing
- [ ] Test with invalid payment reference
- [ ] Test with mismatched amount
- [ ] Test with invalid course ID
- [ ] Test with unauthenticated request
- [ ] Verify appropriate error messages shown

### Security Testing
- [ ] Attempt to read payments without auth (should fail)
- [ ] Attempt to modify payment record (should fail)
- [ ] Attempt to access course without verified enrollment (should fail)
- [ ] Verify unauthenticated users cannot see payments

### Database Verification
- [ ] Check `/payments` collection has payment records
- [ ] Check `/enrollments` has verified enrollments
- [ ] Check `/courses/{courseId}/students/` populated
- [ ] Check `/users/{userId}/enrollments/` populated
- [ ] Verify course enrollment count incremented

## Monitoring

### Logs to Monitor
- [ ] Firebase Cloud Function logs - Watch for errors
- [ ] Firestore operations - Monitor for access denied errors
- [ ] Client console - Check for API errors
- [ ] Paystack webhooks (optional) - Verify webhook delivery

### Key Metrics
- [ ] Payment success rate
- [ ] Verification time (should be < 5 seconds)
- [ ] Cloud Function execution time
- [ ] Error rates by type

### Common Issues to Watch
- [ ] PAYSTACK_SECRET_KEY not configured
- [ ] Firebase token expiration
- [ ] Firestore quota exceeded
- [ ] Paystack API unavailability
- [ ] Network timeouts

## Production Readiness

### Before Going Live
- [ ] Obtain live Paystack credentials
- [ ] Update environment variables with live keys
- [ ] Test end-to-end flow with live credentials
- [ ] Perform stress testing (if applicable)
- [ ] Document refund process
- [ ] Train support team on payment issues
- [ ] Set up payment reconciliation process

### Paystack Keys
- [ ] Test keys: pk_test_*, sk_test_*
- [ ] Live keys: pk_live_*, sk_live_*
- [ ] Never commit keys to repository
- [ ] Rotate keys periodically

### Backup Plans
- [ ] Manual verification process for failed payments
- [ ] Refund process documentation
- [ ] Escalation path for payment issues
- [ ] Customer support playbook

## Rollback Plan

If issues occur:
1. [ ] Revert Firestore rules to previous version
2. [ ] Disable payment button in UI
3. [ ] Mark Cloud Function as private
4. [ ] Communicate with affected users
5. [ ] Fix issues in development environment
6. [ ] Re-test before re-deployment

## Documentation

- [ ] PAYSTACK_SETUP.md - Setup guide
- [ ] PAYMENT_IMPLEMENTATION_GUIDE.md - Developer guide
- [ ] PAYSTACK_INTEGRATION_COMPLETE.md - Complete overview
- [ ] QUICK_PAYSTACK_REFERENCE.md - Quick reference
- [ ] Support documentation - For support team

## Handoff Checklist

### Stakeholders to Notify
- [ ] Development team - How to troubleshoot
- [ ] Support team - Refund process
- [ ] Finance team - Payment reconciliation
- [ ] Product team - Feature announcement
- [ ] Users - Payment workflow instructions

### Documentation to Share
- [ ] Payment troubleshooting guide
- [ ] Refund policy
- [ ] Payment failure recovery steps
- [ ] Contact support process

## Final Verification

Before marking as complete:
- [ ] All payments create `/payments` records
- [ ] All enrollments marked as verified
- [ ] All students can access courses after payment
- [ ] No security rule violations
- [ ] Cloud Function has no errors
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Team is trained

## Sign-off

- [ ] Deployment lead: _____________
- [ ] Date: _____________
- [ ] Notes: _________________________________

---

## Continuous Monitoring (Post-Deployment)

Weekly:
- [ ] Review payment success metrics
- [ ] Check error logs
- [ ] Verify payment records are being created
- [ ] Confirm verification times are normal

Monthly:
- [ ] Review payment trends
- [ ] Audit failed payment attempts
- [ ] Check for unusual patterns
- [ ] Review customer complaints
- [ ] Validate reconciliation

Quarterly:
- [ ] Security audit of payment flow
- [ ] Firestore rule review
- [ ] Cost analysis
- [ ] Performance optimization review
- [ ] Competitor feature comparison
