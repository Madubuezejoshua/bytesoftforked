import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types";
import { BookOpen, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
  onViewTeacher?: (teacherId: string) => void;
  showEnrollButton?: boolean;
}

const CourseCard = ({ course, onEnroll, onViewDetails, onViewTeacher, showEnrollButton = true }: CourseCardProps) => {
  const navigate = useNavigate();

  const getTeacherId = () => {
    if (course.instructorId) return course.instructorId;
    if (course.instructorIds && course.instructorIds.length > 0) return course.instructorIds[0];
    return null;
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course.id);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-primary/10 text-primary';
      case 'intermediate':
        return 'bg-primary/20 text-primary';
      case 'advanced':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="shadow-soft hover:shadow-medium transition-smooth overflow-hidden">
      <div className="relative h-48 bg-muted">
        <img 
          src={course.thumbnailUrl} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-4 right-4 ${getLevelColor(course.level)}`}>
          {course.level}
        </Badge>
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{course.title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{course.enrollmentCount} enrolled</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Instructor</p>
          <p className="font-semibold">{course.instructorName}</p>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {showEnrollButton && (
          <Button
            className="flex-1 min-w-[120px]"
            onClick={() => onEnroll?.(course.id)}
            disabled={!course.isActive}
          >
            {course.isActive ? 'Enroll Now' : 'Unavailable'}
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 min-w-[120px]"
          onClick={handleViewDetails}
        >
          Details
        </Button>
        {getTeacherId() && (
          <Button
            variant="outline"
            className="flex-1 min-w-[120px]"
            onClick={() => onViewTeacher?.(getTeacherId()!)}
          >
            Teacher
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
