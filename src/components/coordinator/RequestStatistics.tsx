import { useEffect, useState } from 'react';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const RequestStatistics = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'course_requests'),
      orderBy('requestedDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CourseRequest));

        const pending = requests.filter((r) => r.status === 'pending').length;
        const approved = requests.filter((r) => r.status === 'approved').length;
        const rejected = requests.filter((r) => r.status === 'rejected').length;

        setStats({
          total: requests.length,
          pending,
          approved,
          rejected,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching requests:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const pendingPercent =
    stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const approvedPercent =
    stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const rejectedPercent =
    stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <FileText className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <Progress
            value={pendingPercent}
            className="mt-2 h-1 bg-yellow-100"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(pendingPercent)}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
          <Progress value={approvedPercent} className="mt-2 h-1 bg-green-100" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(approvedPercent)}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <Progress value={rejectedPercent} className="mt-2 h-1 bg-red-100" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(rejectedPercent)}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestStatistics;
