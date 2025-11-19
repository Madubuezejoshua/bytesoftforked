import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { Enrollment, Course } from '@/types';

interface EnrolledCourseCardProps {
  enrollment: Enrollment & { course?: Course };
  onViewTeacher: (teacherId: string) => void;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({
  enrollment,
  onViewTeacher,
}) => {
  const navigate = useNavigate();
  const getTeacherId = () => {
    if (!enrollment.course) return null;
    if (enrollment.course.instructorId) return enrollment.course.instructorId;
    if (enrollment.course.instructorIds && enrollment.course.instructorIds.length > 0) {
      return enrollment.course.instructorIds[0];
    }
    return null;
  };

  const teacherId = getTeacherId();
  const isVerified = enrollment.verifiedAt;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Course Image */}
        {enrollment.course?.thumbnailUrl && (
          <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            <img
              src={enrollment.course.thumbnailUrl}
              alt={enrollment.courseName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Course Content */}
        <div className="flex flex-col sm:flex-row flex-1 p-4 sm:p-6">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{enrollment.courseName}</h3>
                {enrollment.course?.category && (
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">
                    {enrollment.course.category}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <Badge
                className={`flex-shrink-0 flex items-center gap-1 ${
                  isVerified
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
                {isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Pending
                  </>
                )}
              </Badge>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Code: {enrollment.enrollmentCode}</span>
              </div>
              {enrollment.course && (
                <div className="font-medium text-foreground">
                  ₦{enrollment.course.price.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-col sm:justify-end sm:items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/courses/${enrollment.courseId}`)}
              className="gap-2 whitespace-nowrap transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4" />
              <span>Details</span>
            </Button>
            {teacherId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewTeacher(teacherId)}
                className="gap-2 whitespace-nowrap transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <User className="w-4 h-4" />
                <span>View Teacher</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnrolledCourseCard;
