import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Enrollment } from '@/types';
import { Users, Search } from 'lucide-react';
import { courseService } from '@/lib/courseService';
import { toast } from 'sonner';

interface CourseStudentsListProps {
  courseId: string;
  courseName: string;
}

export const CourseStudentsList = ({ courseId, courseName }: CourseStudentsListProps) => {
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Enrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const unsubscribe = courseService.subscribeToStudentsByCourse(
        courseId,
        (enrollments) => {
          const sortedEnrollments = [...enrollments].sort(
            (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
          );
          setStudents(sortedEnrollments);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading students:', error);
          toast.error('Failed to load course students');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up subscription:', error);
      toast.error('Failed to load course students');
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = students.filter(student =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

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
              <CardTitle className="text-lg">Students in {courseName}</CardTitle>
              <CardDescription>{students.length} total students</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery.trim() ? 'No students match your search' : 'No students enrolled in this course'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredStudents.map(enrollment => (
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
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                      <Badge className={`text-xs ${getStatusColor(enrollment.paymentStatus)}`}>
                        {enrollment.paymentStatus}
                      </Badge>
                    </div>
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
