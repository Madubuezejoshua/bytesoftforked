import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Users, BookOpen, Video, Star, Mail, Calendar, ChevronLeft, ArrowUp } from 'lucide-react';
import { courseDetailsService } from '@/lib/courseDetailsService';
import { CourseDetails } from '@/types';
import { toast } from 'sonner';
import TeacherReviewsDisplay from '@/components/coordinator/TeacherReviewsDisplay';
import CoordinatorReviewForm from '@/components/coordinator/CoordinatorReviewForm';

const CoordinatorCourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [refreshReviews, setRefreshReviews] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'coordinator' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId, user, navigate]);

  const loadCourseDetails = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const courseDetails = await courseDetailsService.getCourseDetails(courseId);
      setDetails(courseDetails);
    } catch (error) {
      console.error('Error loading course details:', error);
      toast.error('Failed to load course details');
      navigate('/coordinator-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/coordinator-dashboard')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/coordinator-dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Course Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-muted/50 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{details.course.title}</CardTitle>
                <CardDescription className="text-base">{details.course.description}</CardDescription>
              </div>
              {details.course.thumbnailUrl && (
                <img
                  src={details.course.thumbnailUrl}
                  alt={details.course.title}
                  className="w-40 h-40 object-cover rounded-lg flex-shrink-0"
                />
              )}
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
                <Badge variant="outline" className="capitalize">{details.course.level}</Badge>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Total Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{details.teachers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Assigned to course</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{details.enrolledStudents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Enrolled in course</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-600" />
                Classes Held
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{details.totalClassesHeld}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed sessions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Users className="w-4 h-4 hidden sm:inline" />
              <span className="hidden sm:inline">Teachers</span>
              <span className="sm:hidden">Teachers</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4 hidden sm:inline" />
              <span className="hidden sm:inline">Students</span>
              <span className="sm:hidden">Students</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Video className="w-4 h-4 hidden sm:inline" />
              <span className="hidden sm:inline">Classes</span>
              <span className="sm:hidden">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4 hidden sm:inline" />
              <span className="hidden sm:inline">Reviews</span>
              <span className="sm:hidden">Reviews</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Teachers Assigned
                </CardTitle>
                <CardDescription>
                  {details.teachers.length} teacher{details.teachers.length !== 1 ? 's' : ''} assigned to this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {details.teachers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No teachers assigned to this course</p>
                ) : (
                  <div className="space-y-4">
                    {details.teachers.map((teacher) => (
                      <div key={teacher.id} className="border rounded-lg p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                        {teacher.profilePicture && (
                          <img
                            src={teacher.profilePicture}
                            alt={teacher.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base">{teacher.name}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Joined {formatDate(teacher.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Enrolled Students
                </CardTitle>
                <CardDescription>
                  {details.enrolledStudents.length} student{details.enrolledStudents.length !== 1 ? 's' : ''} enrolled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {details.enrolledStudents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No students enrolled yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold">Name</th>
                          <th className="text-left py-3 px-2 font-semibold">Email</th>
                          <th className="text-left py-3 px-2 font-semibold">Enrollment Code</th>
                          <th className="text-left py-3 px-2 font-semibold">Enrolled Date</th>
                          <th className="text-left py-3 px-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.enrolledStudents.map((enrollment) => (
                          <tr key={enrollment.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-2">{enrollment.studentName}</td>
                            <td className="py-3 px-2 text-muted-foreground">{enrollment.studentEmail}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="font-mono text-xs">{enrollment.enrollmentCode}</Badge>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground text-xs">
                              {formatDate(enrollment.enrolledAt)}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant={enrollment.verified ? 'default' : 'secondary'}>
                                {enrollment.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Classes Held
                </CardTitle>
                <CardDescription>
                  Total: {details.totalClassesHeld} completed class{details.totalClassesHeld !== 1 ? 'es' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {details.completedMeetings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No classes held yet</p>
                ) : (
                  <div className="space-y-3">
                    {details.completedMeetings.map((meeting) => (
                      <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">{meeting.title}</h3>
                            <p className="text-muted-foreground text-sm">{meeting.teacherName}</p>
                          </div>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            {formatDate(meeting.scheduledTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {selectedTeacherId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedTeacherId(null)}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Teachers
                  </button>
                  <h3 className="text-lg font-semibold">
                    {details.teachers.find(t => t.id === selectedTeacherId)?.name}
                  </h3>
                </div>
                <TeacherReviewsDisplay
                  key={`${selectedTeacherId}-${refreshReviews}`}
                  teacherId={selectedTeacherId}
                  teacherName={details.teachers.find(t => t.id === selectedTeacherId)?.name || 'Teacher'}
                />
                {user && (
                  <CoordinatorReviewForm
                    teacherId={selectedTeacherId}
                    courseId={details.course.id}
                    coordinatorId={user.id}
                    coordinatorName={user.name}
                    onReviewSubmitted={() => setRefreshReviews(!refreshReviews)}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Teacher Reviews
                  </CardTitle>
                  <CardDescription>
                    Select a teacher to view and manage reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {details.teachers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No teachers assigned to this course</p>
                  ) : (
                    <div className="space-y-3">
                      {details.teachers.map(teacher => (
                        <button
                          key={teacher.id}
                          onClick={() => setSelectedTeacherId(teacher.id)}
                          className="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold group-hover:text-primary">{teacher.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{teacher.email}</p>
                            </div>
                            <Star className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoordinatorCourseDetailsPage;
