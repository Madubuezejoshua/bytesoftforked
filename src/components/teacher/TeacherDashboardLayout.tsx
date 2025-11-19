import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { User, Course, Enrollment, ScheduledClass } from '@/types';
import { TeacherInfoCard } from './TeacherInfoCard';
import { StudentsList } from './StudentsList';
import { ClassesHeldCounter } from './ClassesHeldCounter';
import { TeacherReviewPanel } from './TeacherReviewPanel';

interface TeacherDashboardLayoutProps {
  teacher: User | null;
  courses: Course[];
  enrollments: Enrollment[];
  scheduledClasses: ScheduledClass[];
  loading?: boolean;
}

export const TeacherDashboardLayout = ({
  teacher,
  courses,
  enrollments,
  scheduledClasses,
  loading = false,
}: TeacherDashboardLayoutProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: true,
    students: true,
    classes: true,
    reviews: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Teacher Profile Section */}
      <Collapsible open={expandedSections.profile} onOpenChange={() => toggleSection('profile')}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-2 mb-2 hover:bg-muted"
          >
            <span className="text-base font-semibold">Teacher Profile</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expandedSections.profile ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 animation-in fade-in-50">
          <TeacherInfoCard teacher={teacher} />
        </CollapsibleContent>
      </Collapsible>

      {/* Students Section */}
      <Collapsible open={expandedSections.students} onOpenChange={() => toggleSection('students')}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-2 mb-2 hover:bg-muted"
          >
            <span className="text-base font-semibold">
              Enrolled Students ({enrollments.length})
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expandedSections.students ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 animation-in fade-in-50">
          <StudentsList enrollments={enrollments} loading={loading} />
        </CollapsibleContent>
      </Collapsible>

      {/* Classes Held Section */}
      <Collapsible open={expandedSections.classes} onOpenChange={() => toggleSection('classes')}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-2 mb-2 hover:bg-muted"
          >
            <span className="text-base font-semibold">Classes Activity</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expandedSections.classes ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 animation-in fade-in-50">
          <ClassesHeldCounter scheduledClasses={scheduledClasses} loading={loading} />
        </CollapsibleContent>
      </Collapsible>

      {/* Reviews Section */}
      <Collapsible open={expandedSections.reviews} onOpenChange={() => toggleSection('reviews')}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-2 mb-2 hover:bg-muted"
          >
            <span className="text-base font-semibold">Student Reviews</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expandedSections.reviews ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 animation-in fade-in-50">
          <TeacherReviewPanel teacherId={teacher?.id || ''} courses={courses} loading={loading} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
