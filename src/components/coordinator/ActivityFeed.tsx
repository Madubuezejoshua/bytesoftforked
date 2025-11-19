import { useEffect, useState } from 'react';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ActivityLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface ActivityFeedProps {
  coordinatorId: string;
}

const ActivityFeed = ({ coordinatorId }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'activityLogs'),
      where('coordinatorId', '==', coordinatorId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ActivityLog));
        setActivities(logs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching activity logs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [coordinatorId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your recent approval and rejection actions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const isApproved = activity.action === 'approved';
              const Icon = isApproved ? CheckCircle : XCircle;
              const iconColor = isApproved ? 'text-green-600' : 'text-red-600';
              const bgColor = isApproved
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200';

              return (
                <div
                  key={activity.id}
                  className={`border rounded-lg p-4 ${bgColor} flex items-center gap-4 transition-all hover:shadow-md`}
                >
                  <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">
                        {activity.teacherName}
                      </p>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.courseTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isApproved
                            ? 'border-green-300 bg-green-100 text-green-700'
                            : 'border-red-300 bg-red-100 text-red-700'
                        }`}
                      >
                        {isApproved ? 'Approved' : 'Rejected'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {activity.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
