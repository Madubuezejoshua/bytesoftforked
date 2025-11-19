import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { classesService } from '@/lib/classesService';
import { Calendar } from 'lucide-react';

interface ClassCountBadgeProps {
  teacherId: string;
  courseId: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  showIcon?: boolean;
}

export const ClassCountBadge = ({
  teacherId,
  courseId,
  variant = 'secondary',
  showIcon = true,
}: ClassCountBadgeProps) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = classesService.subscribeToClassesByTeacherAndCourse(
      teacherId,
      courseId,
      (classes) => {
        setCount(classes.length);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading class count:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId, courseId]);

  if (loading) {
    return <Badge variant={variant} className="gap-1">--</Badge>;
  }

  return (
    <Badge variant={variant} className="gap-1">
      {showIcon && <Calendar className="w-3 h-3" />}
      {count} class{count !== 1 ? 'es' : ''}
    </Badge>
  );
};
