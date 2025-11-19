import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Video, Search } from 'lucide-react';
import { classesService } from '@/lib/classesService';
import { ScheduledClass } from '@/types';
import { toast } from 'sonner';

interface CourseClassHistoryProps {
  teacherId: string;
  courseId: string;
  courseName: string;
}

type StatusFilter = 'all' | 'completed' | 'scheduled' | 'ongoing' | 'cancelled';

export const CourseClassHistory = ({
  teacherId,
  courseId,
  courseName,
}: CourseClassHistoryProps) => {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ScheduledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = classesService.subscribeToClassesByTeacherAndCourse(
      teacherId,
      courseId,
      (fetchedClasses) => {
        setClasses(fetchedClasses);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading classes:', error);
        toast.error('Failed to load class history');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId, courseId]);

  useEffect(() => {
    let filtered = classes;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  }, [classes, searchQuery, statusFilter]);

  const stats = {
    total: classes.length,
    completed: classes.filter(c => c.status === 'completed').length,
    scheduled: classes.filter(c => c.status === 'scheduled').length,
    ongoing: classes.filter(c => c.status === 'ongoing').length,
    cancelled: classes.filter(c => c.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-4 border-l-green-500';
      case 'scheduled':
        return 'border-l-4 border-l-blue-500';
      case 'ongoing':
        return 'border-l-4 border-l-amber-500';
      case 'cancelled':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div>
          <CardTitle className="text-lg">Classes in {courseName}</CardTitle>
          <CardDescription>All scheduled classes for this course</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{stats.ongoing}</p>
            <p className="text-xs text-muted-foreground">Ongoing</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading class history...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery.trim() || statusFilter !== 'all'
                ? 'No classes match your filters'
                : 'No classes scheduled for this course yet'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredClasses.map(classItem => (
                <div
                  key={classItem.id}
                  className={`p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors ${getStatusBgColor(
                    classItem.status
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{classItem.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {classItem.description}
                      </p>
                    </div>
                    <Badge className={`text-xs whitespace-nowrap ${getStatusColor(classItem.status)}`}>
                      {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(classItem.startTime)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                    </div>

                    {classItem.classType === 'online' ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Video className="w-3 h-3" />
                        Online Class
                        {classItem.meetingLink && (
                          <a
                            href={classItem.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline ml-1"
                          >
                            (Join)
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {classItem.location || 'Location TBA'}
                      </div>
                    )}

                    {classItem.enrolledStudents.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {classItem.enrolledStudents.length} / {classItem.maxStudents} students enrolled
                      </div>
                    )}
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
