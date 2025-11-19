import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Enrollment } from '@/types';
import { Users } from 'lucide-react';

interface StudentsListProps {
  enrollments: Enrollment[];
  loading?: boolean;
}

export const StudentsList = ({ enrollments, loading = false }: StudentsListProps) => {
  const [sortedEnrollments, setSortedEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    setSortedEnrollments(
      [...enrollments].sort(
        (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
      )
    );
  }, [enrollments]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Enrolled Students</CardTitle>
              <CardDescription>{enrollments.length} total students</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No students enrolled yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {sortedEnrollments.map(enrollment => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(enrollment.studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{enrollment.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{enrollment.studentEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${getStatusColor(enrollment.paymentStatus)}`}>
                      {enrollment.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
