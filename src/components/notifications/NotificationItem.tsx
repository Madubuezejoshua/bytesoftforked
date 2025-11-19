import { Notification } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem = ({
  notification,
  onDismiss,
  onMarkAsRead,
}: NotificationItemProps) => {
  const isApproved = notification.status === 'approved';
  const bgColor = isApproved
    ? 'bg-green-50 border-green-200'
    : 'bg-red-50 border-red-200';
  const textColor = isApproved ? 'text-green-700' : 'text-red-700';
  const Icon = isApproved ? CheckCircle : XCircle;
  const iconColor = isApproved ? 'text-green-600' : 'text-red-600';

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
    <div
      className={`border rounded-lg p-4 ${bgColor} transition-all hover:shadow-md ${
        !notification.read ? 'ring-2 ring-offset-2 ring-blue-300' : ''
      }`}
      onClick={() => onMarkAsRead?.(notification.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-semibold text-sm ${textColor}`}>
                {isApproved ? 'Approved' : 'Rejected'}
              </p>
              <Badge
                variant="outline"
                className={`text-xs ${
                  isApproved
                    ? 'border-green-300 bg-green-100 text-green-700'
                    : 'border-red-300 bg-red-100 text-red-700'
                }`}
              >
                {notification.courseTitle}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isApproved
                ? `Your request has been approved by ${notification.coordinatorName}`
                : `Your request was rejected by ${notification.coordinatorName}`}
            </p>
            {!isApproved && notification.reason && (
              <div className={`mt-2 p-2 rounded bg-white/50 border-l-2 ${
                isApproved ? 'border-green-300' : 'border-red-300'
              }`}>
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Reason: </span>
                  {notification.reason}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {formatTime(notification.timestamp)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationItem;
