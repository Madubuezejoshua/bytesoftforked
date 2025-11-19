import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Video, Clock, ArrowRight } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Enrollment, Course } from '@/types';
import MeetingsList from '@/components/meetings/MeetingsList';
import TeacherDetailsDialog from '@/components/teacher/TeacherDetailsDialog';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import EnrolledCourseCard from '@/components/dashboard/EnrolledCourseCard';
import { SpecialLinksTab } from '@/components/courses/SpecialLinksTab';
import { purchasedCoursesService } from '@/lib/purchasedCoursesService';
import { verificationService } from '@/lib/verificationService';
import { VerifiedBadge } from '@/components/ui/verified-badge';

interface EnrolledCourse extends Enrollment {
  course?: Course;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [showTeacherDetails, setShowTeacherDetails] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    fetchEnrolledCourses();
    setupVerificationListener();
  }, [user, navigate]);

  const setupVerificationListener = () => {
    if (!user?.id) return;

    const unsubscribe = verificationService.subscribeToUserVerificationStatus(
      user.id,
      (status) => {
        setIsVerified(status.isVerified);
      },
      (error) => {
        console.error('Error listening to verification status:', error);
      }
    );

    return () => {
      unsubscribe?.();
    };
  };

  const fetchEnrolledCourses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const purchasedCourses = await purchasedCoursesService.getStudentPurchasedCourses(user.id);

      const enrolledWithCourses = purchasedCourses.map((course, index) => ({
        id: `${course.id}-${index}`,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        courseId: course.id,
        courseName: course.title,
        enrollmentCode: '',
        paymentStatus: 'completed' as const,
        paymentReference: '',
        amount: course.price,
        enrolledAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        verifiedBy: null,
        verified: true,
        verificationMethod: null,
        course: course
      })) as EnrolledCourse[];

      setEnrolledCourses(enrolledWithCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setShowTeacherDetails(true);
  };


  const navigationItems = [
    {
      label: 'Browse Courses',
      onClick: () => navigate('/courses'),
    },
    {
      label: 'My Courses',
      onClick: () => setActiveTab('courses'),
    },
    {
      label: 'Meetings',
      onClick: () => setActiveTab('meetings'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Student Dashboard"
        userName={user?.name || 'Student'}
        userEmail={user?.email || ''}
        navigationItems={navigationItems}
        onLogout={handleLogout}
        isVerified={isVerified}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">Here's an overview of your learning progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              icon={BookOpen}
              label="Your Purchased Courses"
              value={enrolledCourses.length}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              gradient
            />

            <StatsCard
              icon={GraduationCap}
              label="Verified Status"
              value={isVerified ? 'Yes' : 'No'}
              iconBgColor={isVerified ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}
              iconColor={isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}
              gradient
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Your Purchased Courses</TabsTrigger>
            <TabsTrigger value="links">Special Links</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Purchased Courses</CardTitle>
                <CardDescription>All courses you have access to</CardDescription>
              </CardHeader>
            </Card>

            {loading ? (
              <Card className="p-12">
                <div className="flex items-center justify-center">
                  <p className="text-muted-foreground">Loading your courses...</p>
                </div>
              </Card>
            ) : enrolledCourses.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Button
                    onClick={() => navigate('/courses')}
                    className="gap-2"
                  >
                    Browse Courses
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((enrollment) => (
                  <EnrolledCourseCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    onViewTeacher={handleViewTeacher}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="links">
            <SpecialLinksTab />
          </TabsContent>

          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Online Meetings
                </CardTitle>
                <CardDescription>Join scheduled video meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <MeetingsList userRole="student" />
                <p className="text-xs text-muted-foreground mt-4">Showing meetings you are invited to.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedTeacherId && (
          <TeacherDetailsDialog
            teacherId={selectedTeacherId}
            isOpen={showTeacherDetails}
            onClose={() => setShowTeacherDetails(false)}
          />
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
