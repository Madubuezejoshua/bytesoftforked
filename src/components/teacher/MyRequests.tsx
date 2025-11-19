import { useEffect, useState } from 'react';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courseRequestService } from '@/lib/courseRequestService';
import { CourseRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface MyRequestsProps {
  teacherId: string;
}

const MyRequests = ({ teacherId }: MyRequestsProps) => {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'course_requests'),
      where('teacherId', '==', teacherId),
      orderBy('requestedDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseRequest[];
        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load your requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId]);

  const handleCancelClick = (requestId: string) => {
    setCancelingId(requestId);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelingId) return;

    try {
      await courseRequestService.cancelRequest(cancelingId);
      toast.success('Request cancelled successfully');
      setShowCancelDialog(false);
      setCancelingId(null);
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
              Pending
            </Badge>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
              Approved
            </Badge>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
              Rejected
            </Badge>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-gray-600" />
            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
              Cancelled
            </Badge>
          </div>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading your requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You haven't submitted any course requests yet. Browse courses to request access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Requests
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Awaiting coordinator review</p>
          </div>
          {pendingRequests.map(request => (
            <Card key={request.id} className="shadow-soft hover:shadow-medium transition-smooth">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-lg">{request.courseTitle}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Course Request</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Requested Date</p>
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(request.requestedDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelClick(request.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviewedRequests.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Review History
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Processed requests</p>
          </div>
          {reviewedRequests.map(request => (
            <Card key={request.id} className="shadow-soft hover:shadow-medium transition-smooth">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-lg">{request.courseTitle}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Course Request</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Requested Date</p>
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(request.requestedDate)}
                      </div>
                    </div>
                    {request.reviewedDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Review Date</p>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(request.reviewedDate)}
                        </div>
                      </div>
                    )}
                  </div>

                  {request.coordinatorName && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">Reviewed By</p>
                      <p className="text-sm font-medium mt-1">{request.coordinatorName}</p>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="pt-2 border-t border-border bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-700">{request.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this course request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Request
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyRequests;
