import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';
import { Mail, Calendar } from 'lucide-react';

interface TeacherInfoCardProps {
  teacher: User | null;
}

export const TeacherInfoCard = ({ teacher }: TeacherInfoCardProps) => {
  if (!teacher) return null;

  const initials = teacher.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Teacher Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {teacher.profilePicture ? (
              <img src={teacher.profilePicture} alt={teacher.name} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{teacher.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{teacher.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(teacher.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
