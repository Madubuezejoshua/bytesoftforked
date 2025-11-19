import { useEffect, useState } from 'react';
import { onSnapshot, query, collection, where, orderBy, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courseRequestService } from '@/lib/courseRequestService';
import { notificationService } from '@/lib/notificationService';
import { CourseRequest, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface CourseRequestsTabProps {
  coordinatorId: string;
  coordinatorName: string;
}

const CourseRequestsTab = ({ coordinatorId, coordinatorName }: CourseRequestsTabProps) => {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'course_requests'),
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
        toast.error('Failed to load course requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.teacherName.toLowerCase().includes(query) ||
        r.courseTitle.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchQuery]);

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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApproveClick = (requestId: string) => {
    setApprovingId(requestId);
    setShowApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingId) return;

    setApproveLoading(true);
    try {
      const request = requests.find(r => r.id === approvingId);
      if (!request) throw new Error('Request not found');

      await courseRequestService.approveRequest(approvingId, coordinatorId, coordinatorName);

      await courseRequestService.addInstructorToCourse(
        request.courseId,
        request.teacherId,
        request.teacherName
      );

      await notificationService.createNotification(
        request.teacherId,
        request.courseTitle,
        'approved',
        coordinatorName,
        ''
      );

      await notificationService.createActivityLog(
        coordinatorId,
        coordinatorName,
        'approved',
        request.teacherId,
        request.teacherName,
        request.courseTitle
      );

      toast.success('Request approved successfully');
      setShowApproveDialog(false);
      setApprovingId(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectClick = (requestId: string) => {
    setRejectingId(requestId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (rejectReason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }

    setRejectLoading(true);
    try {
      const request = requests.find(r => r.id === rejectingId);
      if (!request) throw new Error('Request not found');

      await courseRequestService.rejectRequest(
        rejectingId,
        coordinatorId,
        rejectReason.trim(),
        coordinatorName
      );

      await notificationService.createNotification(
        request.teacherId,
        request.courseTitle,
        'rejected',
        coordinatorName,
        rejectReason.trim()
      );

      await notificationService.createActivityLog(
        coordinatorId,
        coordinatorName,
        'rejected',
        request.teacherId,
        request.teacherName,
        request.courseTitle,
        rejectReason.trim()
      );

      toast.success('Request rejected successfully');
      setShowRejectDialog(false);
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setRejectLoading(false);
    }
  };


  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading course requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Requests</CardTitle>
          <CardDescription>Review and approve teacher course requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by teacher name or course title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-fit">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                  <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                  <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                  <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== 'all' || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {requests.length === 0
                ? 'No course requests yet.'
                : 'No requests match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(request => (
            <Card key={request.id} className="shadow-soft hover:shadow-medium transition-smooth flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-grow">
                    <CardTitle className="text-lg line-clamp-2">{request.courseTitle}</CardTitle>
                    <CardDescription className="mt-1">by {request.teacherName}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow">
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Requested Date</p>
                    <p className="font-medium">{formatDate(request.requestedDate)}</p>
                  </div>

                  {request.reviewedDate && (
                    <div>
                      <p className="text-muted-foreground">Reviewed Date</p>
                      <p className="font-medium">{formatDate(request.reviewedDate)}</p>
                    </div>
                  )}

                  {request.coordinatorName && (
                    <div>
                      <p className="text-muted-foreground">Reviewed By</p>
                      <p className="font-medium">{request.coordinatorName}</p>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-700">{request.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>

              {request.status === 'pending' && (
                <div className="p-4 border-t border-border flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleApproveClick(request.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectClick(request.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the teacher's request and add them to the course instructor list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              disabled={approveLoading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {approveLoading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this course request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection (minimum 10 characters)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {rejectReason.length}/500 characters
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={rejectLoading || rejectReason.trim().length < 10}
                className="flex-1"
              >
                {rejectLoading ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseRequestsTab;
