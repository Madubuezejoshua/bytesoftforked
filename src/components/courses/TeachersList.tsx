import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Calendar } from 'lucide-react';
import { User } from '@/types';

interface TeachersListProps {
  teachers: User[];
}

const TeachersList = ({ teachers }: TeachersListProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (teachers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Teachers
          </CardTitle>
          <CardDescription>No teachers assigned to this course yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No teachers have been assigned to this course.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Instructors
        </CardTitle>
        <CardDescription>{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} assigned</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers.map(teacher => (
            <div
              key={teacher.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-12 w-12 flex-shrink-0">
                {teacher.profilePicture && <AvatarImage src={teacher.profilePicture} alt={teacher.name} />}
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(teacher.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{teacher.name}</h3>
                  <Badge variant="secondary" className="text-xs">Teacher</Badge>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {formatDate(teacher.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeachersList;
