import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { courseAccessService } from '@/lib/courseAccessService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface EnrollmentStatusProps {
  courseId: string;
}

export const EnrollmentStatus = ({ courseId }: EnrollmentStatusProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    hasAccess: boolean;
    isEnrolled: boolean;
    verified: boolean;
    paymentStatus: string | null;
  } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.id) {
        setLoading(true);
        const accessInfo = await courseAccessService.getCurrentUserAccess(courseId);
        setStatus(accessInfo);
        setLoading(false);
      }
    };
    checkStatus();
  }, [courseId, user?.id]);

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (status.hasAccess) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Verified Enrollment</AlertTitle>
        <AlertDescription className="text-green-700">
          Your payment has been verified. You have full access to this course.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.isEnrolled && !status.verified) {
    if (status.paymentStatus === 'completed') {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Payment Pending Verification</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your payment is being verified. This usually takes a few minutes. Please refresh the page if you've been waiting for a while.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Enrollment Not Verified</AlertTitle>
        <AlertDescription className="text-red-700">
          Your enrollment could not be verified. Please contact support for assistance.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.isEnrolled && status.verified && status.paymentStatus !== 'completed') {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Payment Status Issue</AlertTitle>
        <AlertDescription className="text-blue-700">
          There's an issue with your payment status. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
