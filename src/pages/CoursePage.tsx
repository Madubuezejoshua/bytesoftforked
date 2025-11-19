import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { courseDetailsService } from '@/lib/courseDetailsService';
import { CourseDetails } from '@/types';
import { toast } from 'sonner';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TeachersList from '@/components/courses/TeachersList';
import StudentsList from '@/components/courses/StudentsList';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!courseId) {
      setError('Course not found');
      setLoading(false);
      return;
    }

    loadCourseDetails();
  }, [user, courseId, navigate]);

  const loadCourseDetails = async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);
    try {
      const courseDetails = await courseDetailsService.getCourseDetails(courseId);
      setDetails(courseDetails);
    } catch (error) {
      console.error('Error loading course details:', error);
      setError('Failed to load course details. The course may not exist.');
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      label: 'Back to Catalog',
      onClick: () => navigate('/courses'),
    },
  ];

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          title="Course Details"
          userName={user?.name || ''}
          userEmail={user?.email || ''}
          navigationItems={navigationItems}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading course details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          title="Course Details"
          userName={user?.name || ''}
          userEmail={user?.email || ''}
          navigationItems={navigationItems}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-6 py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/courses')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error || 'The course could not be found.'}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Course Details"
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        navigationItems={navigationItems}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/courses')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        <div className="space-y-6">
          <Card className="bg-muted/50 overflow-hidden">
            <div className="relative h-48 bg-muted">
              {details.course.thumbnailUrl && (
                <img
                  src={details.course.thumbnailUrl}
                  alt={details.course.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{details.course.title}</CardTitle>
                  <CardDescription className="mt-3 text-base">{details.course.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Category</p>
                  <p className="font-semibold">{details.course.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Level</p>
                  <Badge variant="outline" className="capitalize">
                    {details.course.level}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{details.course.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Price</p>
                  <p className="font-semibold">₦{details.course.price.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="teachers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Teachers</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Students</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teachers" className="space-y-4">
              <TeachersList teachers={details.teachers} />
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <StudentsList enrollments={details.enrolledStudents} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CoursePage;
