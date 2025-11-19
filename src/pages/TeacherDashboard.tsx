import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Calendar, Clock, Video, MapPin, ChevronDown, TrendingUp } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course, Enrollment, ScheduledClass } from '@/types';
import BrowseCourses from '@/components/teacher/BrowseCourses';
import MyRequests from '@/components/teacher/MyRequests';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import ScheduleClassForm from '@/components/classes/ScheduleClassForm';
import ScheduleClassDialog from '@/components/classes/ScheduleClassDialog';
import { TeacherDashboardLayout } from '@/components/teacher/TeacherDashboardLayout';
import { CourseStudentsList } from '@/components/teacher/CourseStudentsList';
import { ClassCountBadge } from '@/components/teacher/ClassCountBadge';
import { CourseClassHistory } from '@/components/teacher/CourseClassHistory';
import { courseService } from '@/lib/courseService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import { SendLinksDialog } from '@/components/teacher/SendLinksDialog';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
    }
    fetchTeacherData();
  }, [user, navigate]);

  const fetchTeacherData = () => {
    if (!user) return;

    try {
      // Real-time listener for teacher's courses
      const coursesQuery = query(
        collection(db, 'courses'),
        where('instructorId', '==', user.id)
      );
      const coursesUnsubscribe = onSnapshot(coursesQuery, (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        setCourses(coursesData);

        // Fetch enrollments for teacher's courses
        const courseIds = coursesData.map(c => c.id);
        if (courseIds.length > 0) {
          const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('courseId', 'in', courseIds)
          );
          const enrollmentsUnsubscribe = onSnapshot(enrollmentsQuery, (enrollmentsSnapshot) => {
            const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Enrollment[];
            setEnrollments(enrollmentsData);
          });
          return () => enrollmentsUnsubscribe();
        }
      });

      // Real-time listener for approved courses for scheduling
      const approvedCoursesUnsubscribe = courseService.subscribeToApprovedCourses(
        user.id,
        (courses) => {
          setApprovedCourses(courses);
        },
        (error) => {
          console.error('Error loading approved courses:', error);
          toast.error('Failed to load approved courses for scheduling');
        }
      );

      // Real-time listener for scheduled classes
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('teacherId', '==', user.id),
        orderBy('startTime', 'desc')
      );
      const classesUnsubscribe = onSnapshot(classesQuery, (snapshot) => {
        const classesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ScheduledClass[];
        setScheduledClasses(classesData);
        setLoading(false);
      });

      return () => {
        coursesUnsubscribe();
        approvedCoursesUnsubscribe();
        classesUnsubscribe();
      };
    } catch (error) {
      console.error('Error setting up real-time listeners:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalStudents = enrollments.length;
  const hasApprovedCourses = approvedCourses.length > 0;
  const upcomingClasses = scheduledClasses.filter(c =>
    c.status === 'scheduled' && new Date(c.startTime) > new Date()
  ).length;

  const navigationItems = [
    {
      label: 'My Courses',
      onClick: () => setActiveTab('courses'),
    },
    {
      label: 'Browse Courses',
      onClick: () => setActiveTab('browse'),
    },
    {
      label: 'Classes',
      onClick: () => setActiveTab('classes'),
    },
    {
      label: 'Meetings',
      onClick: () => setActiveTab('meetings'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Teacher Dashboard"
        userName={user?.name || 'Teacher'}
        userEmail={user?.email || ''}
        navigationItems={navigationItems}
        onLogout={handleLogout}
        notificationPanel={user?.id ? <NotificationPanel teacherId={user.id} /> : undefined}
        isVerified={user?.isVerified}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-muted-foreground">Here's an overview of your teaching activity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              icon={BookOpen}
              label="My Courses"
              value={courses.length}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              gradient
            />

            <StatsCard
              icon={Users}
              label="Total Students"
              value={totalStudents}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
              gradient
            />

            <StatsCard
              icon={Calendar}
              label="Upcoming Classes"
              value={upcomingClasses}
              iconBgColor="bg-rose-100 dark:bg-rose-900/30"
              iconColor="text-rose-600 dark:text-rose-400"
              gradient
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="course-students">Course Students</TabsTrigger>
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="links">Share Links</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <TeacherDashboardLayout
              teacher={user}
              courses={courses}
              enrollments={enrollments}
              scheduledClasses={scheduledClasses}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {loading ? (
              <Card className="p-12">
                <div className="flex items-center justify-center">
                  <p className="text-muted-foreground">Loading your courses...</p>
                </div>
              </Card>
            ) : courses.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No courses assigned yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Request access to courses to start teaching
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {courses.map(course => (
                  <Collapsible key={course.id} open={expandedCourseId === course.id} onOpenChange={(open) => setExpandedCourseId(open ? course.id : null)}>
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                          <div className="flex items-center justify-between w-full p-6">
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
                              <div className="flex items-center gap-4 mt-3 flex-wrap">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>{enrollments.filter(e => e.courseId === course.id).length} students</span>
                                </div>
                                <ClassCountBadge
                                  teacherId={user?.id || ''}
                                  courseId={course.id}
                                  variant="outline"
                                  showIcon={true}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <ScheduleClassDialog
                                course={course}
                                teacherId={user?.id || ''}
                                teacherName={user?.name || ''}
                                onClassScheduled={fetchTeacherData}
                              />
                              <ChevronDown className={`w-5 h-5 transition-transform text-muted-foreground ${expandedCourseId === course.id ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t border-border">
                        <div className="p-6">
                          <CourseClassHistory
                            teacherId={user?.id || ''}
                            courseId={course.id}
                            courseName={course.title}
                          />
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <BrowseCourses
              teacherId={user?.id || ''}
              teacherName={user?.name || ''}
            />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Course Requests</CardTitle>
                <CardDescription>Track your course access requests</CardDescription>
              </CardHeader>
              <CardContent>
                <MyRequests teacherId={user?.id || ''} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students enrolled in your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : enrollments.length === 0 ? (
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map(enrollment => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <h3 className="font-semibold">{enrollment.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{enrollment.studentEmail}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Course: {enrollment.courseName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-primary">{enrollment.enrollmentCode}</p>
                          <p className="text-xs text-muted-foreground">Enrollment Code</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scheduled Classes</CardTitle>
                    <CardDescription>Your upcoming and past classes</CardDescription>
                  </div>
                  <ScheduleClassForm
                    courses={approvedCourses}
                    teacherId={user?.id || ''}
                    teacherName={user?.name || ''}
                    onClassScheduled={() => fetchTeacherData()}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !hasApprovedCourses && scheduledClasses.length === 0 ? (
                  <div className="space-y-4 text-center py-8">
                    <p className="font-medium text-muted-foreground">No approved courses yet. Please contact your coordinator.</p>
                    <p className="text-sm text-muted-foreground">
                      To schedule classes, request access to courses in the "Browse Courses" tab. Once approved by a coordinator, you'll be able to schedule classes.
                    </p>
                  </div>
                ) : scheduledClasses.length === 0 ? (
                  <p className="text-muted-foreground">No classes scheduled yet. Click the "Schedule Class" button above to create your first class.</p>
                ) : (
                  <div className="space-y-4">
                    {scheduledClasses.map(classItem => (
                      <div key={classItem.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{classItem.title}</h3>
                            <p className="text-sm text-muted-foreground">{classItem.courseName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(classItem.startTime).toLocaleString()}
                              </div>
                              {classItem.classType === 'online' ? (
                                <div className="flex items-center gap-1">
                                  <Video className="w-4 h-4" />
                                  Online
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  Physical
                                </div>
                              )}
                            </div>
                            {classItem.meetingLink && classItem.classType === 'online' && (
                              <div className="mt-2">
                                <a
                                  href={classItem.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Join Meeting Link
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{classItem.enrolledStudents.length} students</p>
                            <p className="text-xs text-muted-foreground">Enrolled</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="course-students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>View Students by Course</CardTitle>
                <CardDescription>Select a course to view all enrolled students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading courses...</p>
                ) : courses.length === 0 ? (
                  <p className="text-muted-foreground">No courses assigned yet.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {courses.map(course => (
                        <Button
                          key={course.id}
                          variant={selectedCourseId === course.id ? 'default' : 'outline'}
                          className="justify-start text-left h-auto py-3"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setSelectedCourseName(course.title);
                          }}
                        >
                          <div className="w-full">
                            <p className="font-semibold line-clamp-1">{course.title}</p>
                            <p className="text-xs opacity-75">
                              {enrollments.filter(e => e.courseId === course.id).length} students
                            </p>
                          </div>
                        </Button>
                      ))}
                    </div>
                    {selectedCourseId && (
                      <div className="mt-6 pt-6 border-t">
                        <CourseStudentsList
                          courseId={selectedCourseId}
                          courseName={selectedCourseName}
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Share Special Links</CardTitle>
                    <CardDescription>Send resources and links to your students</CardDescription>
                  </div>
                  <SendLinksDialog
                    courses={approvedCourses}
                    enrollments={enrollments}
                    teacherId={user?.id || ''}
                    teacherName={user?.name || ''}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use the Send Link button above to share resources, articles, or important links with your students in specific courses.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="text-5xl mb-4 opacity-50">🚀</div>
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">Online meeting features are coming soon. Stay tuned!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
